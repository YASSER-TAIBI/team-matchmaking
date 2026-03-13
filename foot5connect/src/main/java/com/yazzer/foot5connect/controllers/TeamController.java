package com.yazzer.foot5connect.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yazzer.foot5connect.dto.TeamDto;
import com.yazzer.foot5connect.services.TeamService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping("/create")
    public ResponseEntity<TeamDto> createTeam() {
        return ResponseEntity.ok(teamService.createTeam());
    }

    @GetMapping("/me")
    public ResponseEntity<TeamDto> findMyTeam() {
        return ResponseEntity.ok(teamService.findMyTeam());
    }

    @PutMapping("/update")
    public ResponseEntity<TeamDto> updateTeam(@RequestBody TeamDto teamDto) {
        return ResponseEntity.ok(teamService.updateTeam(teamDto));
    }

    @DeleteMapping("/me/leave")
    public ResponseEntity<Void> leaveMyTeam() {
        teamService.leaveMyTeam();
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/me/rejoin")
    public ResponseEntity<Void> rejoinMyTeam() {
        teamService.rejoinMyTeam();
        return ResponseEntity.ok().build();
    }
}
