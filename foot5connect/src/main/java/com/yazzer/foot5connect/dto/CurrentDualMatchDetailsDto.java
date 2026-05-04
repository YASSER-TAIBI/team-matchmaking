package com.yazzer.foot5connect.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class CurrentDualMatchDetailsDto {

    private Long matchId;
    private LocalDate matchDate;
    private LocalTime startTime;
    private String location;
    private TeamDto myTeam;
    private TeamDto opponentTeam;
}
