package com.project.coursebuilder.controller;

import com.project.coursebuilder.repository.QuizRepository;
import com.project.coursebuilder.service.OpenRouterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin
public class QuizController {

    private final OpenRouterService aiService;

    @Autowired
    private QuizRepository quizRepository;  // ← inject the repository

    public QuizController(OpenRouterService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/quiz")
    public String generateQuiz(@RequestBody Map<String, String> request) {
        String topic = request.get("topic");
        return aiService.generateQuiz(topic);
    }

    // GET /quiz/count → returns total quiz records in DB
    @GetMapping("/quiz/count")
    public ResponseEntity<Map<String, Long>> getQuizCount() {
        long count = quizRepository.count();
        return ResponseEntity.ok(Map.of("count", count));
    }
}