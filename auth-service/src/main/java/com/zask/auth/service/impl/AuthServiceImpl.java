package com.zask.auth.service.impl;

import com.zask.auth.dto.*;
import com.zask.auth.entity.User;
import com.zask.auth.repository.UserRepository;
import com.zask.auth.service.AuthService;
import com.zask.auth.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already registered");

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .username(request.getUsername())
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getEmail(), user.getRole(),
                                user.getUserId(), "Registration successful", user.getFullName());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isActive())
            throw new RuntimeException("Account is deactivated");

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
            throw new RuntimeException("Invalid password");

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getEmail(), user.getRole(),
                                user.getUserId(), "Login successful", user.getFullName());
    }

    @Override
    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User getUserById(int id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateProfile(int userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        return userRepository.save(user);
    }

    @Override
    public void changePassword(int userId, String oldPassword, String newPassword) {
        User user = getUserById(userId);
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash()))
            throw new RuntimeException("Old password is incorrect");
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void deactivateAccount(int userId) {
        User user = getUserById(userId);
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public List<User> searchUsers(String name) {
        return userRepository.findByFullNameContainingIgnoreCase(name);
    }
    
    @Override
    public String refreshToken(String token) {
        if (!jwtUtil.validateToken(token))
            throw new RuntimeException("Invalid or expired token");
        String email = jwtUtil.extractEmail(token);
        User user = getUserByEmail(email);
        return jwtUtil.generateToken(user.getEmail(), user.getRole());
    }

    @Override
    public void logout(String token) {
        // Stateless JWT - client just discards token
        // We just validate it exists
        if (!jwtUtil.validateToken(token))
            throw new RuntimeException("Invalid token");
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("No account with that email exists."));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        if (mailSender != null) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Zask - Password Reset Request");
            message.setText("Click the following link to reset your password:\n" +
                            "http://localhost:4200/reset-password?token=" + token);
            try {
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("Could not send email: " + e.getMessage());
            }
        } else {
            System.out.println("Mock Email to " + email + ": Reset token is " + token);
        }
    }

    @Override
    public void resetPassword(String resetToken, String newPassword) {
        User user = userRepository.findByResetToken(resetToken)
            .orElseThrow(() -> new RuntimeException("Invalid reset token."));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
}