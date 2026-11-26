package com.gathercart.service;

import com.gathercart.dto.BulkPoolSuggestionRequest;
import com.gathercart.dto.BulkPoolSuggestionResponse;
import com.gathercart.entity.BulkPoolSuggestion;
import com.gathercart.entity.User;
import com.gathercart.repository.BulkPoolSuggestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkPoolSuggestionService {

    private final BulkPoolSuggestionRepository suggestionRepository;

    @Transactional
    public BulkPoolSuggestionResponse createSuggestion(BulkPoolSuggestionRequest request, User currentUser) {
        String phone = trimOrNull(request.getContactPhone());
        if (phone == null && currentUser != null) {
            phone = currentUser.getPhone();
        }

        BulkPoolSuggestion suggestion = BulkPoolSuggestion.builder()
                .userId(currentUser != null ? currentUser.getId() : null)
                .productName(request.getProductName().trim())
                .category(trimOrNull(request.getCategory()))
                .clusterName(trimOrNull(request.getClusterName()) != null
                        ? trimOrNull(request.getClusterName())
                        : "Madhapur, Hyderabad")
                .notes(trimOrNull(request.getNotes()))
                .contactPhone(phone)
                .status("PENDING")
                .build();

        return toResponse(suggestionRepository.save(suggestion));
    }

    @Transactional(readOnly = true)
    public List<BulkPoolSuggestionResponse> getMySuggestions(Long userId) {
        return suggestionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String trimOrNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private BulkPoolSuggestionResponse toResponse(BulkPoolSuggestion entity) {
        return BulkPoolSuggestionResponse.builder()
                .id(entity.getId())
                .productName(entity.getProductName())
                .category(entity.getCategory())
                .clusterName(entity.getClusterName())
                .notes(entity.getNotes())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
