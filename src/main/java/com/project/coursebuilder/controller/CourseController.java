package com.project.coursebuilder.controller;

import com.project.coursebuilder.entity.Course;
import com.project.coursebuilder.repository.CourseRepository;
import com.project.coursebuilder.service.OpenRouterService;
import com.project.coursebuilder.service.YouTubeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseRepository repo;
    private final OpenRouterService aiService;

    @Autowired
    private YouTubeService youTubeService;

    public CourseController(CourseRepository repo, OpenRouterService aiService) {
        this.repo = repo;
        this.aiService = aiService;
    }

    // ✅ GENERATE COURSE
    @PostMapping("/generate")
    public Course generateCourse(@RequestBody Map<String, String> request) {
        String topic = request.get("topic");
        String content = aiService.generateCourseContent(topic);

        Course course = new Course();
        course.setTopic(topic);
        course.setContent(content);
        course.setLevel("Generated");
        course.setDuration(5);

        return repo.save(course);
    }

    // GET ALL
    @GetMapping
    public List<Course> getAllCourses() {
        return repo.findAll();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }

    // GET /courses/{id}/videos → fetch YouTube videos for a course topic
    @GetMapping("/{id}/videos")
    public ResponseEntity<?> getCourseVideos(@PathVariable Long id) {
        return repo.findById(id)                          // ← was courseRepository, now repo
                .map(course -> {
                    List<Map<String, String>> videos =
                            youTubeService.searchVideos(course.getTopic(), 4);
                    return ResponseEntity.ok(videos);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}