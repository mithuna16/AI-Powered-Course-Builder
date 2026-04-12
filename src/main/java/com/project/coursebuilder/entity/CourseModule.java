package com.project.coursebuilder.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "course_module")
public class CourseModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private int moduleOrder;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public int getModuleOrder() { return moduleOrder; }
    public void setModuleOrder(int moduleOrder) { this.moduleOrder = moduleOrder; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
}