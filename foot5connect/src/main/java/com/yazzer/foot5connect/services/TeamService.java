package com.yazzer.foot5connect.services;

import com.yazzer.foot5connect.dto.TeamDto;

public interface TeamService {

    TeamDto createTeam();

    TeamDto findMyTeam();

    TeamDto findMyMemberTeam();

    boolean hasMyTeamMembership();

    TeamDto updateTeam(TeamDto teamDto);

    void leaveMyTeam();

    void rejoinMyTeam();

    void removeMemberFromMyTeam(Long userId);
}
