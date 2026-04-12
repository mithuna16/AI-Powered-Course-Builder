package com.project.coursebuilder.controller;

import com.project.coursebuilder.entity.Achievement;
import com.project.coursebuilder.entity.User;
import com.project.coursebuilder.entity.UserAchievement;
import com.project.coursebuilder.repository.AchievementRepository;
import com.project.coursebuilder.repository.UserRepository;
import com.project.coursebuilder.repository.UserAchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "*")
public class AchievementController {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public List<UserAchievement> getUserAchievements(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return userAchievementRepository.findByUser(user);
    }

    @GetMapping("/all")
    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
    }
}