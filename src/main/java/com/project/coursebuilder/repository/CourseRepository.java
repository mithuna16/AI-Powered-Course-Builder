package com.project.coursebuilder.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.project.coursebuilder.entity.Course;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByTopicIgnoreCase(String topic);

    List<Course> findByUserId(Long userId);

    // Sum of all course durations for a user (in hours)
    @Query("SELECT COALESCE(SUM(c.duration), 0) FROM Course c WHERE c.userId = :userId")
    int sumDurationByUserId(@Param("userId") Long userId);
}
