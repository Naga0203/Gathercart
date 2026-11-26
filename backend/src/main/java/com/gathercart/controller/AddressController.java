package com.gathercart.controller;

import com.gathercart.common.ApiResponse;
import com.gathercart.dto.AddressRequest;
import com.gathercart.dto.AddressResponse;
import com.gathercart.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(Authentication auth) {
        List<AddressResponse> addresses = addressService.getUserAddresses(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(addresses, "Addresses retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            Authentication auth,
            @Valid @RequestBody AddressRequest request) {
        AddressResponse address = addressService.createAddress(auth.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(address, "Address created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        AddressResponse address = addressService.updateAddress(auth.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success(address, "Address updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(Authentication auth, @PathVariable Long id) {
        addressService.deleteAddress(auth.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Address deleted"));
    }
}
