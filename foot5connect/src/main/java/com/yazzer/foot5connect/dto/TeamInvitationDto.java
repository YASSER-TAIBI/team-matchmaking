package com.yazzer.foot5connect.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.yazzer.foot5connect.models.InvitationStatus;
import com.yazzer.foot5connect.models.InvitationType;
import com.yazzer.foot5connect.models.TeamInvitation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class TeamInvitationDto {

    private Long id;
    private InvitationStatus status;
    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Long teamId;
    private String teamName;
    private Long invitedUserId;
    private String invitedUserFirstName;
    private String invitedUserLastName;
    private String invitedUserLevel;
    private InvitationType type;

    public static TeamInvitationDto fromEntity(TeamInvitation teamInvitation) {
        if (teamInvitation == null) {
            return null;
            // TODO throw an exception
        }
        return TeamInvitationDto.builder()
                .id(teamInvitation.getId())
                .status(teamInvitation.getStatus())
                .availableDate(teamInvitation.getAvailableDate())
                .startTime(teamInvitation.getStartTime())
                .endTime(teamInvitation.getEndTime())
                .teamId(teamInvitation.getTeam() != null ? teamInvitation.getTeam().getId() : null)
                .teamName(teamInvitation.getTeam() != null ? teamInvitation.getTeam().getName() : null)
                .invitedUserId(teamInvitation.getInvitedUser() != null ? teamInvitation.getInvitedUser().getId() : null)
                .invitedUserFirstName(teamInvitation.getInvitedUser() != null ? teamInvitation.getInvitedUser().getFirstName() : null)
                .invitedUserLastName(teamInvitation.getInvitedUser() != null ? teamInvitation.getInvitedUser().getLastName() : null)
                .invitedUserLevel(teamInvitation.getInvitedUser() != null && teamInvitation.getInvitedUser().getLevel() != null ? teamInvitation.getInvitedUser().getLevel().name() : null)
                .type(teamInvitation.getType())
                .build();
    }
}
