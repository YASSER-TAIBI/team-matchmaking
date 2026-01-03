package com.yazzer.foot5connect.dto;

import com.yazzer.foot5connect.models.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class MatchRequestDto {

    private Long id;

    private LocalDate matchDate;

    private String timeSlot;

    private MatchRequestStatus status;

    private Long teamId;

    public static MatchRequestDto fromEntity(MatchRequest matchRequest) {
        if (matchRequest == null) {
            return null;
        }
        return MatchRequestDto.builder()
                .id(matchRequest.getId())
                .matchDate(matchRequest.getMatchDate())
                .timeSlot(matchRequest.getTimeSlot())
                .status(matchRequest.getStatus())
                .teamId(matchRequest.getTeam().getId())
                .build();
    }

    public static MatchRequest toEntity(MatchRequestDto matchRequestDto) {
        if (matchRequestDto == null) {
            return null;
            // TODO throw an exception
        }
        return MatchRequest.builder()
                .id(matchRequestDto.getId())
                .matchDate(matchRequestDto.getMatchDate())
                .timeSlot(matchRequestDto.getTimeSlot())
                .status(matchRequestDto.getStatus())
                .team(
                        Team.builder()
                                .id(matchRequestDto.getTeamId())
                                .build()
                )
                .build();
    }

}
