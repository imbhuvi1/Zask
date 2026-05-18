package com.zask.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.zask.auth.repository.UserRepository;
import com.zask.auth.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AuthServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
	}

	@Bean
	CommandLineRunner seedAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (!userRepository.existsByEmail("admin@zask.com")) {
				User admin = User.builder()
						.fullName("PLATFORM_ADMIN")
						.email("admin@zask.com")
						.passwordHash(passwordEncoder.encode("admin@123"))
						.username("admin")
						.role("PLATFORM_ADMIN")
						.active(true)
						.provider("LOCAL")
						.build();
				userRepository.save(admin);
				System.out.println("Admin user seeded successfully.");
			}
		};
	}
}
