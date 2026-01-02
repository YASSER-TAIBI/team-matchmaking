package com.yazzer.foot5connect.dto;

import com.yazzer.foot5connect.models.Match;
import com.yazzer.foot5connect.models.MatchStatus;
import com.yazzer.foot5connect.models.Team;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class MatchDto {

    private Integer id;

    private LocalDate matchDate;
    private LocalTime startTime;
    private String location;

    private MatchStatus status;

    private Integer scoreTeamA;
    private Integer scoreTeamB;

    private Set<Integer> teamIds;

    private Integer matchRequestId;

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
                .scoreTeamA(match.getScoreTeamA())
                .scoreTeamB(match.getScoreTeamB())
                .teamIds(match.getTeams()
                        .stream().map(Team::getId)
                        .collect(Collectors.toSet()))
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
                .scoreTeamA(matchDto.getScoreTeamA())
                .scoreTeamB(matchDto.getScoreTeamB())
                .build();
    }
}
