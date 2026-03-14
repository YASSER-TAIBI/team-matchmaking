package com.yazzer.foot5connect.services.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.yazzer.foot5connect.config.JwtUtils;
import com.yazzer.foot5connect.dto.AuthenticationRequest;
import com.yazzer.foot5connect.dto.AuthenticationResponse;
import com.yazzer.foot5connect.dto.AvailablePlayerDto;
import com.yazzer.foot5connect.dto.DisponibilityDetailDto;
import com.yazzer.foot5connect.dto.PasswordResetDto;
import com.yazzer.foot5connect.dto.PasswordResetRequest;
import com.yazzer.foot5connect.dto.UserDto;
import com.yazzer.foot5connect.models.AvailabilityStatus;
import com.yazzer.foot5connect.models.DisponibilityDetail;
import com.yazzer.foot5connect.models.InvitationStatus;
import com.yazzer.foot5connect.models.PlayerLevel;
import com.yazzer.foot5connect.models.Role;
import com.yazzer.foot5connect.models.TeamInvitation;
import com.yazzer.foot5connect.models.Token;
import com.yazzer.foot5connect.models.TokenType;
import com.yazzer.foot5connect.models.User;
import com.yazzer.foot5connect.repositories.DisponibilityDetailRepository;
import com.yazzer.foot5connect.repositories.RoleRepository;
import com.yazzer.foot5connect.repositories.TeamInvitationRepository;
import com.yazzer.foot5connect.repositories.UserRepository;
import com.yazzer.foot5connect.services.TokenService;
import com.yazzer.foot5connect.services.UserService;
import com.yazzer.foot5connect.services.email.EmailService;
import com.yazzer.foot5connect.validators.ObjectsValidator;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final DisponibilityDetailRepository disponibilityDetailRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private static final String ROLE_USER = "ROLE_USER";
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authManager;
    private final ObjectsValidator<UserDto> validator;
    private final RoleRepository roleRepository;
    private final TokenService tokenService;
    private final EmailService emailService;


    @Override
    public Long save(UserDto dto) {
        validator.validate(dto);
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
        // TODO check before delete
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public AuthenticationResponse register(UserDto dto) {
        validator.validate(dto);
        
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("Les mots de passe ne correspondent pas");
        }

        /* ================= CREATE USER ================= */

        User user = UserDto.toEntity(dto);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(findOrCreateRole(ROLE_USER));
        user.setAvailabilityStatus(AvailabilityStatus.INDISPONIBLE);
        user.setLevel(PlayerLevel.DEBUTANT);
        user.setTotalMatches(0);
        user.setTotalGoals(0);
        user.setActive(false);
        var savedUser = userRepository.save(user);

        /* ================= CREATE CONFIRMATION TOKEN ================= */

        Token confirmationToken = new Token();
        confirmationToken.setUser(savedUser);
        confirmationToken.setType(TokenType.CONFIRMATION);
        confirmationToken.setExpiresAt(LocalDateTime.now().plusMinutes(20));
        confirmationToken.setToken(UUID.randomUUID().toString());
        tokenService.saveToken(confirmationToken);

        /* ================= SEND CONFIRMATION EMAIL ================= */

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
       Token confirmationToken = tokenService.findByTokenAndType(token, TokenType.CONFIRMATION)
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

    @Override
    public AuthenticationResponse requestPasswordReset(PasswordResetRequest request) {
        if (request == null || request.getEmail() == null) {
            throw new IllegalArgumentException("Email is required");
        }

        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            Token resetToken = new Token();
            resetToken.setUser(user);
            resetToken.setType(TokenType.PASSWORD_RESET);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(20));
            resetToken.setToken(UUID.randomUUID().toString());
            tokenService.saveToken(resetToken);
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken());
        });

        return AuthenticationResponse.builder()
                .token("not_accessible")
                .message("Si un compte existe pour cet email, un lien de réinitialisation vous a été envoyé.")
                .build();
    }

    @Override
    public void validatePasswordResetToken(String token) {
        Token resetToken = tokenService.findByTokenAndType(token, TokenType.PASSWORD_RESET)
                .orElseThrow(() -> new EntityNotFoundException("No reset token was found with the provided token :" + token));

        if (resetToken.getConfirmedAt() != null) {
            throw new IllegalStateException("Token already used");
        }

        LocalDateTime expiredAt = resetToken.getExpiresAt();
        if (expiredAt.isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token expired");
        }
    }

    @Override
    @Transactional
    public AuthenticationResponse resetPassword(PasswordResetDto request) {
        if (request == null || request.getToken() == null) {
            throw new IllegalArgumentException("Token is required");
        }

        if (request.getPassword() == null || request.getConfirmPassword() == null) {
            throw new IllegalArgumentException("Password and confirmPassword are required");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Les mots de passe ne correspondent pas");
        }

        Token resetToken = tokenService.findByTokenAndType(request.getToken(), TokenType.PASSWORD_RESET)
                .orElseThrow(() -> new EntityNotFoundException("No reset token was found with the provided token :" + request.getToken()));

        if (resetToken.getConfirmedAt() != null) {
            throw new IllegalStateException("Token already used");
        }

        LocalDateTime expiredAt = resetToken.getExpiresAt();
        if (expiredAt.isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Token expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        resetToken.setConfirmedAt(LocalDateTime.now());
        tokenService.saveToken(resetToken);

        return AuthenticationResponse.builder()
                .token("not_accessible")
                .message("Mot de passe mis à jour avec succès")
                .build();
    }

    @Override
    @Transactional
    public UserDto saveAvailability(Long userId, DisponibilityDetailDto request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getAvailableDate() == null || request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("availableDate, startTime and endTime are required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No user was found with the provided ID :" + userId));

        boolean exists = disponibilityDetailRepository.existsByUser_IdAndAvailableDateAndStartTimeAndEndTime(
                userId,
                request.getAvailableDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        if (exists) {
            throw new IllegalStateException("Disponibility detail already exists for this user");
        }

        DisponibilityDetail detail = DisponibilityDetail.builder()
                .availableDate(request.getAvailableDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .user(user)
                .build();
        disponibilityDetailRepository.save(detail);

        user.setAvailabilityStatus(AvailabilityStatus.DISPONIBLE);
        userRepository.save(user);

        return UserDto.fromEntity(user);
    }

    @Override
    @Transactional
    public UserDto setUnavailable(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("No user was found with the provided ID :" + userId));

        List<TeamInvitation> pendingInvitations = teamInvitationRepository.findByInvitedUser_IdAndStatus(
                userId,
                InvitationStatus.EN_ATTENTE
        );
        for (TeamInvitation invitation : pendingInvitations) {
            invitation.setStatus(InvitationStatus.ANNULLEE);
        }
        teamInvitationRepository.saveAll(pendingInvitations);

        user.setAvailabilityStatus(AvailabilityStatus.INDISPONIBLE);
        userRepository.save(user);

        return UserDto.fromEntity(user);
    }

    @Override
    @Transactional
    public List<AvailablePlayerDto> findAvailablePlayers() {
        return disponibilityDetailRepository.findLatestDisponibilityForAvailableUsers()
                .stream()
                .map(d -> AvailablePlayerDto.builder()
                        .userId(d.getUser().getId())
                        .firstName(d.getUser().getFirstName())
                        .lastName(d.getUser().getLastName())
                        .country(d.getUser().getCountry())
                        .city(d.getUser().getCity())
                        .level(d.getUser().getLevel())
                        .totalMatches(d.getUser().getTotalMatches())
                        .totalGoals(d.getUser().getTotalGoals())
                        .availableDate(d.getAvailableDate())
                        .startTime(d.getStartTime())
                        .endTime(d.getEndTime())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<AvailablePlayerDto> findAvailablePlayersInMyLocation() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalStateException("User not authenticated");
        }

        User currentUser;
        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            currentUser = user;
        } else if (principal instanceof UserDetails userDetails) {
            currentUser = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new EntityNotFoundException("No user was found with the provided email"));
        } else {
            throw new IllegalStateException("Unsupported authentication principal");
        }

        String country = currentUser.getCountry();
        String city = currentUser.getCity();
        if (country == null || city == null) {
            throw new IllegalStateException("User country and city are required");
        }

        return disponibilityDetailRepository.findLatestDisponibilityForAvailableUsersInLocation(country, city)
                .stream()
                .map(d -> AvailablePlayerDto.builder()
                        .userId(d.getUser().getId())
                        .firstName(d.getUser().getFirstName())
                        .lastName(d.getUser().getLastName())
                        .country(d.getUser().getCountry())
                        .city(d.getUser().getCity())
                        .level(d.getUser().getLevel())
                        .totalMatches(d.getUser().getTotalMatches())
                        .totalGoals(d.getUser().getTotalGoals())
                        .availableDate(d.getAvailableDate())
                        .startTime(d.getStartTime())
                        .endTime(d.getEndTime())
                        .build())
                .collect(Collectors.toList());
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
