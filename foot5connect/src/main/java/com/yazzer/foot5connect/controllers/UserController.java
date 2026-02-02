package com.yazzer.foot5connect.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yazzer.foot5connect.dto.DisponibilityDetailDto;
import com.yazzer.foot5connect.dto.UserDto;
import com.yazzer.foot5connect.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> findById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping("/{id}/availability")
    public ResponseEntity<UserDto> saveAvailability(
            @PathVariable("id") Long id,
            @RequestBody DisponibilityDetailDto request
    ) {
        return ResponseEntity.ok(userService.saveAvailability(id, request));
    }

    @PostMapping("/{id}/availability/unavailable")
    public ResponseEntity<UserDto> setUnavailable(@PathVariable("id") Long id) {
        return ResponseEntity.ok(userService.setUnavailable(id));
    }
}
