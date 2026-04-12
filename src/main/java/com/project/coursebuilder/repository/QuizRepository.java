package com.project.coursebuilder.repository;

import com.project.coursebuilder.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByCourseId(Long courseId);
}
