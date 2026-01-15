package com.yazzer.foot5connect.dto;

import lombok.Data;

@Data
public class PasswordResetDto {

    private String token;

    private String password;

    private String confirmPassword;
}
