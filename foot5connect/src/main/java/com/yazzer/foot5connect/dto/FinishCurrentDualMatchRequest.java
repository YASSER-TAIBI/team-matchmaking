package com.yazzer.foot5connect.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinishCurrentDualMatchRequest {

    private Long myTeamId;
    private Long opponentTeamId;
    private Integer myTeamScore;
    private Integer opponentTeamScore;
    private List<FinishMatchPlayerResultDto> players;
}
