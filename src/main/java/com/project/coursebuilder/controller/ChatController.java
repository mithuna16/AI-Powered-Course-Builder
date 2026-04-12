package com.project.coursebuilder.controller;

import com.project.coursebuilder.service.OpenRouterService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ChatController {

    private final OpenRouterService aiService;

    public ChatController(OpenRouterService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public Map<String, String> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String context = request.getOrDefault("context", "");

        // Use AI service to generate response
        String response = aiService.generateChatResponse(message, context);

        return Map.of("response", response);
    }
}