package com.yazzer.foot5connect.dto;

import com.yazzer.foot5connect.models.AvailabilityStatus;
import com.yazzer.foot5connect.models.User;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;

    @NotNull(message = "Le champ username ne doit pas être vide.")
    @NotEmpty(message = "Le champ username ne doit pas être vide.")
    @NotBlank(message = "Le champ username ne doit pas être vide.")
    private String username;

    @NotNull(message = "Le champ email ne doit pas être vide.")
    @NotEmpty(message = "Le champ email ne doit pas être vide.")
    @NotBlank(message = "Le champ email ne doit pas être vide.")
    @Email(message = "L'adresse e-mail n'est pas conforme.")
    private String email;

    @NotNull(message = "Le champ mot de passe ne doit pas être vide.")
    @NotEmpty(message = "Le champ mot de passe ne doit pas être vide.")
    @NotBlank(message = "Le champ mot de passe ne doit pas être vide.")
    @Size(min = 8, max = 16, message = "Le champ mot de passe doit contenir entre 8 et 16 caractères.")
    private String password;

    @NotNull(message = "Le champ confirmation du mot de passe ne doit pas être vide.")
    @NotEmpty(message = "Le champ confirmation du mot de passe ne doit pas être vide.")
    @NotBlank(message = "Le champ confirmation du mot de passe ne doit pas être vide.")
    private String confirmPassword;

    @NotNull(message = "Le champ prénom ne doit pas être vide.")
    @NotEmpty(message = "Le champ prénom ne doit pas être vide.")
    @NotBlank(message = "Le champ prénom ne doit pas être vide.")
    private String firstName;

    @NotNull(message = "Le champ nom ne doit pas être vide.")
    @NotEmpty(message = "Le champ nom ne doit pas être vide.")
    @NotBlank(message = "Le champ nom ne doit pas être vide.")
    private String lastName;

    @NotNull(message = "Le champ pays ne doit pas être vide.")
    @NotEmpty(message = "Le champ pays ne doit pas être vide.")
    @NotBlank(message = "Le champ pays ne doit pas être vide.")
    private String country;

    @NotNull(message = "Le champ ville ne doit pas être vide.")
    @NotEmpty(message = "Le champ ville ne doit pas être vide.")
    @NotBlank(message = "Le champ ville ne doit pas être vide.")
    private String city;

    private boolean active;

    private AvailabilityStatus availabilityStatus;

    public static UserDto fromEntity(User user) {
        if (user == null) {
            return null;
            // TODO throw an exception
        }
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .password(user.getPassword())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .country(user.getCountry())
                .city(user.getCity())
                .active(user.isActive())
                .availabilityStatus(user.getAvailabilityStatus())
                .build();
    }

    public static User toEntity(UserDto userDto) {
        if (userDto == null) {
            return null;
            // TODO throw an exception
        }
        return User.builder()
                .id(userDto.getId())
                .username(userDto.getUsername())
                .email(userDto.getEmail())
                .password(userDto.getPassword())
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .country(userDto.getCountry())
                .city(userDto.getCity())
                .build();
    }
}
