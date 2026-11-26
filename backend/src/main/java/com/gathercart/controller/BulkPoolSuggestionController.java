package com.gathercart.controller;

import com.gathercart.common.ApiResponse;
import com.gathercart.dto.BulkPoolSuggestionRequest;
import com.gathercart.dto.BulkPoolSuggestionResponse;
import com.gathercart.entity.User;
import com.gathercart.security.CurrentUser;
import com.gathercart.service.BulkPoolSuggestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/pool-suggestions")
@RequiredArgsConstructor
public class BulkPoolSuggestionController {

    private final BulkPoolSuggestionService suggestionService;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<ApiResponse<BulkPoolSuggestionResponse>> createSuggestion(
            @Valid @RequestBody BulkPoolSuggestionRequest request) {
        User user = currentUser.get();
        BulkPoolSuggestionResponse created = suggestionService.createSuggestion(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Bulk pool suggestion submitted"));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<BulkPoolSuggestionResponse>>> getMySuggestions() {
        User user = currentUser.require();
        List<BulkPoolSuggestionResponse> suggestions = suggestionService.getMySuggestions(user.getId());
        return ResponseEntity.ok(ApiResponse.success(suggestions, "Suggestions retrieved"));
    }
}
