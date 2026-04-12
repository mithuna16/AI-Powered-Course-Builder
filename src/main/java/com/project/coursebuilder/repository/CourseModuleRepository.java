package com.project.coursebuilder.repository;

import com.project.coursebuilder.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourseId(Long courseId);
}
