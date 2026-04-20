package com.zask.auth.service;

import com.zask.auth.dto.*;
import com.zask.auth.entity.User;
import java.util.List;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    boolean validateToken(String token);
    User getUserByEmail(String email);
    User getUserById(int id);
    User updateProfile(int userId, UpdateProfileRequest request);
    void changePassword(int userId, String oldPassword, String newPassword);
    void deactivateAccount(int userId);
    List<User> searchUsers(String name);
}