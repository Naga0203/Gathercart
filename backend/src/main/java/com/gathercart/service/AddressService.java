package com.gathercart.service;

import com.gathercart.dto.AddressRequest;
import com.gathercart.dto.AddressResponse;
import com.gathercart.entity.User;
import com.gathercart.entity.UserAddress;
import com.gathercart.repository.UserAddressRepository;
import com.gathercart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final UserAddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(String email) {
        User user = findUser(email);
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse createAddress(String email, AddressRequest request) {
        User user = findUser(email);

        long existingCount = addressRepository.countByUserId(user.getId());
        if (existingCount >= 5) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Maximum 5 addresses allowed");
        }

        boolean makeDefault = request.getIsDefault() != null ? request.getIsDefault() : existingCount == 0;

        UserAddress address = UserAddress.builder()
                .user(user)
                .label(request.getLabel())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .pincode(request.getPincode())
                .isDefault(makeDefault)
                .build();

        address = addressRepository.saveAndFlush(address);

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            addressRepository.clearDefaultExcept(user.getId(), address.getId());
        }

        return toResponse(address);
    }

    @Transactional
    public AddressResponse updateAddress(String email, Long addressId, AddressRequest request) {
        User user = findUser(email);
        UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));

        address.setLabel(request.getLabel());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setPincode(request.getPincode());

        if (request.getIsDefault() != null) {
            address.setIsDefault(request.getIsDefault());
        }

        UserAddress saved = addressRepository.saveAndFlush(address);
        if (Boolean.TRUE.equals(saved.getIsDefault())) {
            addressRepository.clearDefaultExcept(user.getId(), saved.getId());
        }

        return toResponse(saved);
    }

    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = findUser(email);
        UserAddress address = addressRepository.findByIdAndUserId(addressId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));
        addressRepository.delete(address);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private AddressResponse toResponse(UserAddress address) {
        return AddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .pincode(address.getPincode())
                .isDefault(address.getIsDefault())
                .build();
    }
}
