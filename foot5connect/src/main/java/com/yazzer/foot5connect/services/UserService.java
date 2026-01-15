package com.yazzer.foot5connect.services;

import com.yazzer.foot5connect.dto.AuthenticationRequest;
import com.yazzer.foot5connect.dto.AuthenticationResponse;
import com.yazzer.foot5connect.dto.PasswordResetDto;
import com.yazzer.foot5connect.dto.PasswordResetRequest;
import com.yazzer.foot5connect.dto.UserDto;

public interface UserService extends AbstractService <UserDto>{
    
    AuthenticationResponse register(UserDto user);

    AuthenticationResponse login(AuthenticationRequest request);

    void confirmToken(String token);

    AuthenticationResponse requestPasswordReset(PasswordResetRequest request);

    void validatePasswordResetToken(String token);

    AuthenticationResponse resetPassword(PasswordResetDto request);
}
