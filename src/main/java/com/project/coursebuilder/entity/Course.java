package com.project.coursebuilder.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String topic;
    private String level;
    private int duration;
    private Long userId;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<CourseModule> modules;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<QuizQuestion> quizzes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<CourseModule> getModules() { return modules; }
    public void setModules(List<CourseModule> modules) { this.modules = modules; }

    public List<QuizQuestion> getQuizzes() { return quizzes; }
    public void setQuizzes(List<QuizQuestion> quizzes) { this.quizzes = quizzes; }
}