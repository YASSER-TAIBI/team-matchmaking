package com.yazzer.foot5connect.dto;

import com.yazzer.foot5connect.models.Match;
import com.yazzer.foot5connect.models.MatchStatus;
import com.yazzer.foot5connect.models.MatchTeam;
import com.yazzer.foot5connect.models.MatchTeamResult;
import com.yazzer.foot5connect.models.TeamInvitation;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class MatchDto {

    private Long id;

    private LocalDate matchDate;
    private LocalTime startTime;
    private String location;

    private MatchStatus status;

    private List<MatchTeamDto> teams;

    private Long invitationId;

    public static MatchDto fromEntity(Match match) {
        if (match == null) {
            return null;
            // TODO throw an exception
        }
        return MatchDto.builder()
                .id(match.getId())
                .matchDate(match.getMatchDate())
                .startTime(match.getStartTime())
                .location(match.getLocation())
                .status(match.getStatus())
                .teams(Optional.ofNullable(match.getMatchTeams())
                        .orElseGet(List::of)
                        .stream()
                        .map(MatchTeamDto::fromEntity)
                        .toList())
                .invitationId(match.getInvitation() != null ? match.getInvitation().getId() : null)
                .build();
    }

    public static Match toEntity(MatchDto matchDto) {
        if (matchDto == null) {
            return null;
            // TODO throw an exception
        }
        return Match.builder()
                .id(matchDto.getId())
                .matchDate(matchDto.getMatchDate())
                .startTime(matchDto.getStartTime())
                .location(matchDto.getLocation())
                .status(matchDto.getStatus())
                .invitation(
                        TeamInvitation.builder()
                                .id(matchDto.getInvitationId())
                                .build()
                )
                .build();
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @Builder
    public static class MatchTeamDto {
        private Long teamId;
        private Integer score;
        private MatchTeamResult result;

        public static MatchTeamDto fromEntity(MatchTeam matchTeam) {
            if (matchTeam == null) {
                return null;
            }
            return MatchTeamDto.builder()
                    .teamId(matchTeam.getTeam() != null ? matchTeam.getTeam().getId() : null)
                    .score(matchTeam.getScore())
                    .result(matchTeam.getResult())
                    .build();
        }
    }
}
