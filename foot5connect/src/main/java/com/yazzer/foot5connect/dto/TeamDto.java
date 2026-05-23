package com.yazzer.foot5connect.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.yazzer.foot5connect.models.AvailabilityTeamLevel;
import com.yazzer.foot5connect.models.TarificationTerrain;
import com.yazzer.foot5connect.models.Team;
import com.yazzer.foot5connect.models.TeamStatus;
import com.yazzer.foot5connect.models.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class TeamDto {

    private Long id;

    private String name;

    private String logoUrl;

    private String country;

    private String city;

    private LocalDateTime createdDate;

    private TeamStatus status;

    private Long captainId;

    private List<TeamMemberDto> members;
    
    private Integer totalMatches;
    
    private Integer matchesWon;
    
    private Integer matchesLost;
    
    private Integer matchesDrawn;

    private Integer matchesCanceled;

    private AvailabilityTeamLevel teamLevel;

    private LocalDate availableDate;

    private LocalTime startTime;
    
    private LocalTime endTime;

    private String pitchAddress;

    private String titleAddress;

    private String formation;

    private BigDecimal prix;

    private Boolean isAnnuleMatch;

    private TarificationTerrain tarificationTerrain;


    public static TeamDto fromEntity(Team team) {
        if (team == null){
            return null;
            // TODO throw an exception
    }
        return TeamDto.builder()
                .id(team.getId())
                .name(team.getName())
                .logoUrl(team.getLogoUrl())
                .country(team.getCountry())
                .city(team.getCity())
                .createdDate(team.getCreatedDate())
                .status(team.getStatus())
                .captainId(team.getCaptain().getId())
                .members(
                        team.getTeamMembers() != null
                                ? team.getTeamMembers().stream()
                                .sorted((a, b) -> a.getCreatedDate().compareTo(b.getCreatedDate()))
                                .map(TeamMemberDto::fromEntity)
                                .collect(Collectors.toList())
                                : Collections.emptyList()
                )
                .totalMatches(team.getTotalMatches())
                .matchesWon(team.getMatchesWon())
                .matchesLost(team.getMatchesLost())
                .matchesDrawn(team.getMatchesDrawn())
                .matchesCanceled(team.getMatchesCanceled())
                .teamLevel(team.getTeamLevel())
                .availableDate(team.getAvailableDate())
                .startTime(team.getStartTime())
                .endTime(team.getEndTime())
                .pitchAddress(team.getPitchAddress())
                .titleAddress(team.getTitleAddress())
                .formation(team.getFormation())
                .prix(team.getPrix())
                .isAnnuleMatch(team.getIsAnnuleMatch())
                .tarificationTerrain(team.getTarificationTerrain())
                .build();
    }

    public static Team toEntity(TeamDto teamDto) {
        if (teamDto == null){
            return null;
            // TODO throw an exception
        }
        return Team.builder()
                .id(teamDto.getId())
                .name(teamDto.getName())
                .logoUrl(teamDto.getLogoUrl())
                .country(teamDto.getCountry())
                .city(teamDto.getCity())
                .status(teamDto.getStatus())
                .captain(
                        User.builder()
                                .id(teamDto.getCaptainId())
                                .build()
                        )
                .totalMatches(teamDto.getTotalMatches())
                .matchesWon(teamDto.getMatchesWon())
                .matchesLost(teamDto.getMatchesLost())
                .matchesDrawn(teamDto.getMatchesDrawn())
                .matchesCanceled(teamDto.getMatchesCanceled())
                .teamLevel(teamDto.getTeamLevel())
                .availableDate(teamDto.getAvailableDate())
                .startTime(teamDto.getStartTime())
                .endTime(teamDto.getEndTime())
                .pitchAddress(teamDto.getPitchAddress())
                .titleAddress(teamDto.getTitleAddress())
                .formation(teamDto.getFormation())
                .prix(teamDto.getPrix())
                .isAnnuleMatch(teamDto.getIsAnnuleMatch())
                .tarificationTerrain(teamDto.getTarificationTerrain())
                .build();
    }

}
