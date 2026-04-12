package com.project.coursebuilder.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OpenRouterService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateCourseContent(String topic) {

        String url = "https://api.groq.com/openai/v1/chat/completions";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.1-8b-instant");

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content",
                "Generate a COMPLETE course for " + topic + ". " +
                        "Include:\n" +
                        "1. Course Overview (paragraph)\n" +
                        "2. Concepts explained clearly\n" +
                        "3. Examples\n" +
                        "4. Step-by-step explanation\n" +
                        "5. Real-world use cases\n\n" +
                        "IMPORTANT:\n" +
                        "- Do NOT return only headings\n" +
                        "- Write full explanations\n" +
                        "- No markdown symbols like ** or ###\n" +
                        "- Clean readable text"
        );
        messages.add(message);
        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map body = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            return messageObj.get("content").toString();
        } catch (Exception e) {
            System.out.println("AI API ERROR:");
            e.printStackTrace();
            return "AI generation failed";
        }
    }

    public String generateQuiz(String topic) {

        String url = "https://api.groq.com/openai/v1/chat/completions";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.1-8b-instant");

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content",
                "Generate EXACTLY 5 multiple choice questions for " + topic + ".\n\n" +
                        "STRICT FORMAT - follow this exactly:\n\n" +
                        "Q1: Question text here\n" +
                        "A) First option\n" +
                        "B) Second option\n" +
                        "C) Third option\n" +
                        "D) Fourth option\n" +
                        "Answer: A\n\n" +
                        "Q2: Question text here\n" +
                        "A) First option\n" +
                        "B) Second option\n" +
                        "C) Third option\n" +
                        "D) Fourth option\n" +
                        "Answer: B\n\n" +
                        "RULES:\n" +
                        "- Output ONLY the 5 questions in the format above\n" +
                        "- NO extra text before or after\n" +
                        "- NO markdown (no **, no ###)\n" +
                        "- Each question MUST have exactly 4 options A B C D\n" +
                        "- Each question MUST have an Answer line"
        );
        messages.add(message);
        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map body = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            return messageObj.get("content").toString();
        } catch (Exception e) {
            System.out.println("AI Quiz ERROR:");
            e.printStackTrace();
            return "Quiz generation failed";
        }
    }

    public String generateChatResponse(String message, String context) {

        String url = "https://api.groq.com/openai/v1/chat/completions";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "llama-3.1-8b-instant");

        List<Map<String, String>> messages = new ArrayList<>();

        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "You are a helpful AI learning mentor. Help students with their course questions. Context: " + context);
        messages.add(systemMessage);

        Map<String, String> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        userMessage.put("content", message);
        messages.add(userMessage);

        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map body = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            Map<String, Object> messageObj = (Map<String, Object>) choices.get(0).get("message");
            return messageObj.get("content").toString();
        } catch (Exception e) {
            System.out.println("AI Chat ERROR:");
            e.printStackTrace();
            return "Sorry, I'm having trouble responding right now. Please try again.";
        }
    }
}
