package com.yazzer.foot5connect.services;

import java.util.List;

import com.yazzer.foot5connect.dto.CreateTeamInvitationRequest;
import com.yazzer.foot5connect.dto.TeamInvitationDto;

public interface TeamInvitationService {

    TeamInvitationDto createInvitation(CreateTeamInvitationRequest request);

    List<TeamInvitationDto> findMyInvitations();

    TeamInvitationDto acceptInvitation(Long invitationId);

    TeamInvitationDto rejectInvitation(Long invitationId);

    List<TeamInvitationDto> findMemberInvitations();
}
