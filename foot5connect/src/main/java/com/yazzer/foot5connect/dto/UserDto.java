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

    @NotNull(message = "le username ne doit pas etre vide")
    @NotEmpty(message = "le username ne doit pas etre vide")
    @NotBlank(message = "le username ne doit pas etre vide")
    private String username;

    @NotNull(message = "l'email ne doit pas etre vide")
    @NotEmpty(message = "l'email ne doit pas etre vide")
    @NotBlank(message = "l'email ne doit pas etre vide")
    @Email(message = "l'email n'est pas conforme")
    private String email;

    @NotNull(message = "le Mot de passe ne doit pas etre vide")
    @NotEmpty(message = "le Mot de passe ne doit pas etre vide")
    @NotBlank(message = "le Mot de passe ne doit pas etre vide")
    @Size(min = 8, max = 16, message = "le Mot de passe doit être comprise entre 8 et 16")
    private String password;

    @NotNull(message = "la confirmation du mot de passe ne doit pas etre vide")
    @NotEmpty(message = "la confirmation du mot de passe ne doit pas etre vide")
    @NotBlank(message = "la confirmation du mot de passe ne doit pas etre vide")
    private String confirmPassword;

    private String firstName;

    private String lastName;

    @NotNull(message = "le pays ne doit pas etre vide")
    @NotEmpty(message = "le pays ne doit pas etre vide")
    @NotBlank(message = "le pays ne doit pas etre vide")
    private String country;

    @NotNull(message = "le ville ne doit pas etre vide")
    @NotEmpty(message = "le ville ne doit pas etre vide")
    @NotBlank(message = "le ville ne doit pas etre vide")
    private String city;

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
                .username(userDto.getFirstName())
                .email(userDto.getEmail())
                .password(userDto.getPassword())
                .country(userDto.getCountry())
                .city(userDto.getCity())
                .build();
    }
}
