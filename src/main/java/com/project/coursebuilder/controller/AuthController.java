package com.project.coursebuilder.controller;

import com.project.coursebuilder.entity.User;
import com.project.coursebuilder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin
public class AuthController {

    @Autowired
    private UserRepository repo;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        // Check if email already exists
        if (repo.findByEmail(user.getEmail()).isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "ERROR");
            error.put("message", "Email already registered");
            return ResponseEntity.badRequest().body(error);
        }
        user.setXp(0);
        user.setLearningHours(0.0);
        User saved = repo.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("userId", saved.getId());
        response.put("email", saved.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        Optional<User> existing = repo.findByEmail(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        if (existing.isPresent() &&
                existing.get().getPassword().equals(user.getPassword())) {
            User found = existing.get();
            response.put("status", "SUCCESS");
            response.put("userId", found.getId());
            response.put("email", found.getEmail());
            response.put("xp", found.getXp());
            response.put("learningHours", found.getLearningHours());
            return ResponseEntity.ok(response);
        }

        response.put("status", "INVALID");
        return ResponseEntity.status(401).body(response);
    }

    // GET user profile/stats
    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable Long id) {
        return repo.findById(id).map(user -> {
            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("email", user.getEmail());
            profile.put("xp", user.getXp());
            profile.put("learningHours", user.getLearningHours());
            return ResponseEntity.ok(profile);
        }).orElse(ResponseEntity.notFound().build());
    }

    // UPDATE XP
    @PatchMapping("/users/{id}/xp")
    public ResponseEntity<Map<String, Object>> updateXp(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {

        return repo.findById(id).map(user -> {
            int delta = body.getOrDefault("delta", 0);
            user.setXp(user.getXp() + delta);
            repo.save(user);

            Map<String, Object> result = new HashMap<>();
            result.put("xp", user.getXp());
            result.put("learningHours", user.getLearningHours());
            return ResponseEntity.ok(result);
        }).orElse(ResponseEntity.notFound().build());
    }
}
