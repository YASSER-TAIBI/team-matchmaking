package com.yazzer.foot5connect.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yazzer.foot5connect.dto.CurrentDualMatchDetailsDto;
import com.yazzer.foot5connect.dto.CurrentMatchDto;
import com.yazzer.foot5connect.dto.FinishCurrentDualMatchRequest;
import com.yazzer.foot5connect.services.MatchService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping("/me/current-match")
    public ResponseEntity<CurrentMatchDto> findMyCurrentMatch() {
        return ResponseEntity.ok(matchService.findMyCurrentMatch());
    }

    @GetMapping("/me/current-dual-match")
    public ResponseEntity<CurrentDualMatchDetailsDto> findMyCurrentDualMatchDetails() {
        return ResponseEntity.ok(matchService.findMyCurrentDualMatchDetails());
    }

    @PutMapping("/me/current-dual-match/cancel-confirmation")
    public ResponseEntity<CurrentDualMatchDetailsDto> confirmCurrentDualMatchCancellation(@RequestParam boolean confirmed) {
        // Cet endpoint centralise toute la logique métier d'annulation pour éviter de faire de simples updates isolés côté frontend.
        return ResponseEntity.ok(matchService.confirmCurrentDualMatchCancellation(confirmed));
    }

    @PutMapping("/me/current-dual-match/finish")
    public ResponseEntity<Void> finishCurrentDualMatch(@RequestBody FinishCurrentDualMatchRequest request) {
        matchService.finishCurrentDualMatch(request);
        return ResponseEntity.noContent().build();
    }
}
