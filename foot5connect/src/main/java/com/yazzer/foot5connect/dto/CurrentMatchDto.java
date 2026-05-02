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
public class CurrentMatchDto {

    private Long matchId;
    private LocalDate matchDate;
    private LocalTime startTime;
    private String location;
    private Long myTeamId;
    private String myTeamName;
    private Long opponentTeamId;
    private String opponentTeamName;
}
