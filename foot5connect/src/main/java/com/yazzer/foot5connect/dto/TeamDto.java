package com.yazzer.foot5connect.dto;

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

    private TeamStatus status;

    private Long captainId;

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
                .status(team.getStatus())
                .captainId(team.getCaptain().getId())
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
                .build();
    }

}
