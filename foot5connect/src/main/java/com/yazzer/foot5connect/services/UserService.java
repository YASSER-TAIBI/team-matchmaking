package com.yazzer.foot5connect.services;

import com.yazzer.foot5connect.dto.AuthenticationRequest;
import com.yazzer.foot5connect.dto.AuthenticationResponse;
import com.yazzer.foot5connect.dto.UserDto;

public interface UserService extends AbstractService <UserDto>{
    
    AuthenticationResponse register(UserDto user);

    AuthenticationResponse login(AuthenticationRequest request);

    void confirmToken(String token);
}
