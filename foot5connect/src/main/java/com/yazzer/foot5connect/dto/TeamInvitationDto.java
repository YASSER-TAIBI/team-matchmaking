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
    private InvitationType type;

    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private Long senderTeamId;
    private Long receiverTeamId;
    private Long invitedUserId;

    private String senderTeamName;
    private String receiverTeamName;
    private String invitedUserFirstName;
    private String invitedUserLastName;
    private String invitedUserLevel;

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
                .senderTeamId(teamInvitation.getSenderTeam() != null ? teamInvitation.getSenderTeam().getId() : null)
                .receiverTeamId(teamInvitation.getReceiverTeam() != null ? teamInvitation.getReceiverTeam().getId() : null)
                .invitedUserId(teamInvitation.getInvitedUser() != null ? teamInvitation.getInvitedUser().getId() : null)
                .senderTeamName(teamInvitation.getSenderTeam() != null ? teamInvitation.getSenderTeam().getName() : null)
                .receiverTeamName(teamInvitation.getReceiverTeam() != null ? teamInvitation.getReceiverTeam().getName() : null)
                .invitedUserFirstName(teamInvitation.getInvitedUser() != null ? teamInvitation.getInvitedUser().getFirstName() : null)
                .invitedUserLastName(teamInvitation.getInvitedUser() != null ? teamInvitation.getInvitedUser().getLastName() : null)
                .invitedUserLevel(teamInvitation.getInvitedUser() != null && teamInvitation.getInvitedUser().getLevel() != null ? teamInvitation.getInvitedUser().getLevel().name() : null)
                .type(teamInvitation.getType())
                .build();
    }
}
