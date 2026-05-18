package com.zask.auth.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "Username must be alphanumeric only")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    private String username;

    private String avatarUrl;

    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;
}