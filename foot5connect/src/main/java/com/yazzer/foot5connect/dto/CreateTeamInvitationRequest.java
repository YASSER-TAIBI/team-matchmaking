package com.yazzer.foot5connect.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class CreateTeamInvitationRequest {

    private Long invitedUserId;

    private LocalDate availableDate;

    private LocalTime startTime;

    private LocalTime endTime;
}
