package com.yazzer.foot5connect.services;

import java.util.List;

import com.yazzer.foot5connect.dto.CurrentMatchDto;
import com.yazzer.foot5connect.dto.TeamDto;

public interface TeamService {

    TeamDto createTeam();

    TeamDto findMyTeam();

    TeamDto findMyMemberTeam();

    CurrentMatchDto findMyCurrentMatch();

    boolean hasMyTeamMembership();

    TeamDto updateTeam(TeamDto teamDto);

    List<TeamDto> findCompleteTeamsInMyCity();

    void leaveMyTeam();

    void rejoinMyTeam();

    void removeMemberFromMyTeam(Long userId);
}
