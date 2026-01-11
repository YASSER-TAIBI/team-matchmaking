package com.yazzer.foot5connect.services.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.yazzer.foot5connect.config.JwtUtils;
import com.yazzer.foot5connect.dto.AuthenticationRequest;
import com.yazzer.foot5connect.dto.AuthenticationResponse;
import com.yazzer.foot5connect.dto.UserDto;
import com.yazzer.foot5connect.models.AvailabilityStatus;
import com.yazzer.foot5connect.models.Role;
import com.yazzer.foot5connect.models.Token;
import com.yazzer.foot5connect.models.User;
import com.yazzer.foot5connect.repositories.RoleRepository;
import com.yazzer.foot5connect.repositories.UserRepository;
import com.yazzer.foot5connect.services.TokenService;
import com.yazzer.foot5connect.services.UserService;
import com.yazzer.foot5connect.services.email.EmailService;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private static final String ROLE_USER = "ROLE_USER";
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authManager;
    private final RoleRepository roleRepository;
    private final TokenService tokenService;
    private final EmailService emailService;


    @Override
    public Long save(UserDto dto) {
        // TODO validator.validate(dto);
        User user = UserDto.toEntity(dto);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user).getId();
    }

    @Override
    @Transactional
    public List<UserDto> findAll() {
        return userRepository.findAll()
                .stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto findById(Long id) {
        return userRepository.findById(id)
                .map(UserDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("No user was found with the provided ID :"  + id));
    }

    @Override
    public void delete(Long id) {
        // TODO validator.validate(dto);
        // TODO check before delete
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public AuthenticationResponse register(UserDto dto) {
        // TODO validator.validate(dto);
        
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("Les mots de passe ne correspondent pas");
        }

        User user = UserDto.toEntity(dto);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(findOrCreateRole(ROLE_USER));
        user.setAvailabilityStatus(AvailabilityStatus.INDISPONIBLE);
        var savedUser = userRepository.save(user);

        Token confirmationToken = new Token();
        confirmationToken.setUser(savedUser);
        confirmationToken.setExpiresAt(LocalDateTime.now().plusMinutes(20));
        confirmationToken.setToken(UUID.randomUUID().toString());
        tokenService.saveToken(confirmationToken);

        // Send email
        emailService.sendEmail(savedUser.getEmail(), confirmationToken.getToken());

        return AuthenticationResponse.builder()
                .token("not_accessible")
                .message("Compte enregistré. Veuillez confirmer votre compte via votre email.")
                .build();
    }

    @Override
    public AuthenticationResponse login(AuthenticationRequest request) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        final User user = userRepository.findByEmail(request.getEmail()).get();
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("fullName", user.getFirstName() + " " + user.getLastName());
        final String token = jwtUtils.generateToken(user, claims);
        return AuthenticationResponse.builder()
                .token(token)
                .message("Connexion reussie")
                .build();
    }

    @Override
    public void confirmToken(String token) {
        
        // 1. Find the confirmation token
       Token confirmationToken = tokenService.findByToken(token)
               .orElseThrow(() -> new EntityNotFoundException("No confirmation token was found with the provided token :" + token));

        // 2. Check if the token is already confirmed
        if(confirmationToken.getConfirmedAt() != null){
            throw new IllegalStateException("Token already confirmed");
        }

        // 3. Check if the token is expired
        LocalDateTime expiredAt = confirmationToken.getExpiresAt();
        if(expiredAt.isBefore(LocalDateTime.now())){
            throw new IllegalStateException("Token expired");
        }

        // 4. Confirm the token
        confirmationToken.setConfirmedAt(LocalDateTime.now());
        tokenService.saveToken(confirmationToken);

        // 5. Enable the user
        enableUser(confirmationToken.getUser());
    }
    

    private void enableUser(User user) {
        user.setActive(true);
        userRepository.save(user);
    }

    private Role findOrCreateRole(String roleName){
        Role role =roleRepository.findByName(roleName).orElse(null);
        if(role == null){
            return roleRepository.save(
                    Role.builder()
                            .name(roleName)
                            .build()
            );
        }
        return role;
    }
}
