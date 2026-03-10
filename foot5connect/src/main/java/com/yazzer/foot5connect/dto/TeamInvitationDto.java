package com.yazzer.foot5connect.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.yazzer.foot5connect.models.InvitationStatus;
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
    private LocalDateTime createdDate;
    private Long teamId;
    private String teamName;
    private Long invitedUserId;
    private String invitedUserFirstName;
    private String invitedUserLastName;

    public static TeamInvitationDto fromEntity(TeamInvitation invitation) {
        if (invitation == null) {
            return null;
        }

        return TeamInvitationDto.builder()
                .id(invitation.getId())
                .status(invitation.getStatus())
                .availableDate(invitation.getAvailableDate())
                .startTime(invitation.getStartTime())
                .endTime(invitation.getEndTime())
                .createdDate(invitation.getCreatedDate())
                .teamId(invitation.getTeam() != null ? invitation.getTeam().getId() : null)
                .teamName(invitation.getTeam() != null ? invitation.getTeam().getName() : null)
                .invitedUserId(invitation.getInvitedUser() != null ? invitation.getInvitedUser().getId() : null)
                .invitedUserFirstName(invitation.getInvitedUser() != null ? invitation.getInvitedUser().getFirstName() : null)
                .invitedUserLastName(invitation.getInvitedUser() != null ? invitation.getInvitedUser().getLastName() : null)
                .build();
    }
}
