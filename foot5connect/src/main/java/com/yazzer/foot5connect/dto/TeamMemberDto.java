package com.yazzer.foot5connect.dto;

import com.yazzer.foot5connect.models.PlayerPosition;
import com.yazzer.foot5connect.models.Team;
import com.yazzer.foot5connect.models.TeamMember;
import com.yazzer.foot5connect.models.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class TeamMemberDto {

    private Long id;

    private Integer jerseyNumber;

    private PlayerPosition position;

    private boolean isCaptain;

    private Long userId;

    private Long teamId;

    public static TeamMemberDto fromEntity(TeamMember teamMember) {
        if (teamMember == null) {
            return null;
            // TODO throw an exception
        }
        return TeamMemberDto.builder()
                .id(teamMember.getId())
                .jerseyNumber(teamMember.getJerseyNumber())
                .position(teamMember.getPosition())
                .isCaptain(teamMember.isCaptain())
                .userId(teamMember.getUser().getId())
                .teamId(teamMember.getTeam().getId())
                .build();
    }

    public static TeamMember toEntity(TeamMemberDto teamMemberDto) {
        if (teamMemberDto == null) {
            return null;
            // TODO throw an exception
        }
        return TeamMember.builder()
                .id(teamMemberDto.getId())
                .jerseyNumber(teamMemberDto.getJerseyNumber())
                .position(teamMemberDto.getPosition())
                .isCaptain(teamMemberDto.isCaptain())
                .user(
                        User.builder()
                                .id(teamMemberDto.getUserId())
                                .build()
                )
                .team(
                        Team.builder()
                                .id(teamMemberDto.getUserId())
                                .build()
                )
                .build();
    }
}
