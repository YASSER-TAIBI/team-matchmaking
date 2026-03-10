package com.yazzer.foot5connect.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yazzer.foot5connect.dto.CreateTeamInvitationRequest;
import com.yazzer.foot5connect.dto.TeamInvitationDto;
import com.yazzer.foot5connect.services.TeamInvitationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/team-invitations")
@RequiredArgsConstructor
public class TeamInvitationController {

    private final TeamInvitationService teamInvitationService;

    @PostMapping
    public ResponseEntity<TeamInvitationDto> createInvitation(@RequestBody CreateTeamInvitationRequest request) {
        return ResponseEntity.ok(teamInvitationService.createInvitation(request));
    }

    @GetMapping("/me")
    public ResponseEntity<List<TeamInvitationDto>> findMyInvitations() {
        return ResponseEntity.ok(teamInvitationService.findMyInvitations());
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<TeamInvitationDto> acceptInvitation(@PathVariable("id") Long id) {
        return ResponseEntity.ok(teamInvitationService.acceptInvitation(id));
    }

    @PutMapping("/{id}/rejet")
    public ResponseEntity<TeamInvitationDto> rejectInvitation(@PathVariable("id") Long id) {
        return ResponseEntity.ok(teamInvitationService.rejectInvitation(id));
    }
}
