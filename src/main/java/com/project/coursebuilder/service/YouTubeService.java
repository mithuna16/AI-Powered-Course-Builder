package com.project.coursebuilder.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import java.net.URLEncoder;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Service
public class YouTubeService {

    @Value("${youtube.api.key}")   // ← FIXED: reads from application.properties
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public List<Map<String, String>> searchVideos(String topic, int maxResults) {
        try {
            // Use YouTube's public search RSS — no API key needed
            String encodedTopic = java.net.URLEncoder.encode(topic + " tutorial", "UTF-8");
            String url = "https://www.youtube.com/results?search_query=" + encodedTopic + "&sp=EgIQAQ%3D%3D";

            // Use Invidious public API instead (free, no key)
            String apiUrl = "https://inv.tux.pizza/api/v1/search?q="
                    + encodedTopic + "&type=video&fields=videoId,title,author,videoThumbnails";

            String response = restTemplate.getForObject(apiUrl, String.class);
            JsonNode items = mapper.readTree(response);

            List<Map<String, String>> videos = new ArrayList<>();
            int count = 0;
            for (JsonNode item : items) {
                if (count >= maxResults) break;
                String videoId = item.get("videoId").asText();
                String title = item.get("title").asText();
                String channelName = item.get("author").asText();
                String thumbnail = "https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg";

                Map<String, String> video = new HashMap<>();
                video.put("videoId", videoId);
                video.put("title", title);
                video.put("thumbnail", thumbnail);
                video.put("channelName", channelName);
                video.put("embedUrl", "https://www.youtube.com/embed/" + videoId);
                videos.add(video);
                count++;
            }
            return videos;

        } catch (Exception e) {
            System.err.println("Video search error: " + e.getMessage());
            return Collections.emptyList();
        }
    }
}