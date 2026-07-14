package com.zask.auth.resource;

import com.zask.auth.dto.*;
import com.zask.auth.entity.User;
import com.zask.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Authentication & User Profiles", description = "Endpoints for user registration, authentication, token management, profile updates, and admin user controls")
public class AuthResource {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account with details like fullName, email, password, and username.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or email already exists")
    })
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration attempt for email={}", request.getEmail());
        try {
            AuthResponse response = authService.register(request);
            log.info("Registration successful for email={}, userId={}", request.getEmail(), response.getUserId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration failed for email={} - {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT token", description = "Validates the user credentials and returns a JWT token.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logged in successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials or account deactivated")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login attempt for email={}", request.getEmail());
        try {
            AuthResponse response = authService.login(request);
            log.info("Login successful for email={}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("Login failed for email={} - {}", request.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate a JWT token", description = "Validates if a JWT token is still active and structurally valid.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token validation status returned")
    })
    public ResponseEntity<?> validate(@RequestParam String token) {
        return ResponseEntity.ok(Map.of("valid", authService.validateToken(token)));
    }

    @GetMapping("/profile/{userId}")
    @Operation(summary = "Retrieve user profile by ID", description = "Gets profile details of a registered user by their user ID.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User profile found"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> getProfile(@PathVariable int userId) {
        try {
            return ResponseEntity.ok(authService.getUserById(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile/{userId}")
    @Operation(summary = "Update user profile", description = "Updates details like fullName, username, or avatar URL of an existing user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or update constraints fail"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> updateProfile(@PathVariable int userId,
                                           @Valid @RequestBody UpdateProfileRequest request) {
        try {
            return ResponseEntity.ok(authService.updateProfile(userId, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/password/{userId}")
    @Operation(summary = "Change user password", description = "Changes the user password after verifying the old password.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Old password is incorrect or new password validation fails"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> changePassword(@PathVariable int userId,
                                            @RequestBody Map<String, String> body) {
        try {
            authService.changePassword(userId,
                body.get("oldPassword"), body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/deactivate/{userId}")
    @Operation(summary = "Deactivate user account", description = "Sets the user's active status to false, preventing login.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Account deactivated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> deactivate(@PathVariable int userId) {
        try {
            authService.deactivateAccount(userId);
            return ResponseEntity.ok(Map.of("message", "Account deactivated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search users by name", description = "Retrieves a list of users whose names contain the given search query.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users found")
    })
    public ResponseEntity<List<User>> searchUsers(@RequestParam String name) {
        return ResponseEntity.ok(authService.searchUsers(name));
    }

    @GetMapping("/user")
    @Operation(summary = "Get user by email", description = "Gets user details using a search by email address.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User found"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> getUserByEmail(@RequestParam String email) {
        try {
            return ResponseEntity.ok(authService.getUserByEmail(email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    @Operation(summary = "Log out a user", description = "Logs out the user and invalidates the session token.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logged out successfully")
    })
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        try {
            authService.logout(body.get("token"));
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh session token", description = "Refreshes and returns a new JWT token if the current token is valid.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Token expired or invalid")
    })
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        try {
            String newToken = authService.refreshToken(body.get("token"));
            return ResponseEntity.ok(Map.of("token", newToken, "message", "Token refreshed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password request", description = "Generates a reset password link and logs or sends a notification/email to the user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reset link processed successfully"),
        @ApiResponse(responseCode = "404", description = "User email not found")
    })
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            authService.forgotPassword(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "If an account exists, a reset link has been sent."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Resets the password to a new value using a valid reset token.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password has been reset successfully"),
        @ApiResponse(responseCode = "401", description = "Token has expired or is invalid")
    })
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            authService.resetPassword(body.get("token"), body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password has been successfully reset."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/users")
    @Operation(summary = "Get all users (Admin only)", description = "Retrieves a complete list of all users on the platform.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Users list retrieved")
    })
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/admin/users/{userId}/status")
    @Operation(summary = "Toggle user status (Admin only)", description = "Enables/disables user status manually.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User status successfully updated"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> toggleUserStatus(@PathVariable int userId, @RequestBody Map<String, Boolean> body) {
        try {
            boolean isActive = body.getOrDefault("isActive", true);
            authService.toggleUserStatus(userId, isActive);
            return ResponseEntity.ok(Map.of("message", "User status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/users/{userId}")
    @Operation(summary = "Delete user permanently (Admin only)", description = "Permanently deletes user database record.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User deleted successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> deleteUser(@PathVariable int userId) {
        log.warn("Admin action: permanent delete requested for userId={}", userId);
        try {
            authService.deleteUser(userId);
            log.info("User permanently deleted, userId={}", userId);
            return ResponseEntity.ok(Map.of("message", "User deleted permanently"));
        } catch (Exception e) {
            log.error("Failed to delete userId={} - {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}