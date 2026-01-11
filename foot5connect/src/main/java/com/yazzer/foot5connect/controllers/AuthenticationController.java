package com.yazzer.foot5connect.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yazzer.foot5connect.dto.AuthenticationRequest;
import com.yazzer.foot5connect.dto.AuthenticationResponse;
import com.yazzer.foot5connect.dto.UserDto;
import com.yazzer.foot5connect.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register (
            @RequestBody UserDto user) {
        return ResponseEntity.ok(userService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login (
            @RequestBody AuthenticationRequest request
    ){
        return ResponseEntity.ok(userService.login(request));
    }
    
    @GetMapping("/confirmToken")
    public ResponseEntity<String> confirmToken (
            @RequestParam("token") String token
    ){
        userService.confirmToken(token);
        return ResponseEntity.ok("Token confirmed");
    }
}
