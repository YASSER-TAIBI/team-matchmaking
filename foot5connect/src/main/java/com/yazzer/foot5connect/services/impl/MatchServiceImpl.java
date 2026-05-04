package com.yazzer.foot5connect.services.impl;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yazzer.foot5connect.dto.CurrentDualMatchDetailsDto;
import com.yazzer.foot5connect.dto.CurrentMatchDto;
import com.yazzer.foot5connect.dto.TeamDto;
import com.yazzer.foot5connect.models.Match;
import com.yazzer.foot5connect.models.MatchStatus;
import com.yazzer.foot5connect.models.Team;
import com.yazzer.foot5connect.models.TeamMember;
import com.yazzer.foot5connect.models.TeamStatus;
import com.yazzer.foot5connect.models.User;
import com.yazzer.foot5connect.repositories.MatchRepository;
import com.yazzer.foot5connect.repositories.TeamMemberRepository;
import com.yazzer.foot5connect.repositories.TeamRepository;
import com.yazzer.foot5connect.services.MatchService;
import com.yazzer.foot5connect.services.auth.AuthenticatedUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final AuthenticatedUserService authenticatedUserService;

    @Override
    @Transactional(readOnly = true)
    public CurrentMatchDto findMyCurrentMatch() {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

        Optional<TeamMember> teamMember = teamMemberRepository.findByUser_Id(currentUser.getId());
        if (teamMember.isEmpty() || teamMember.get().getTeam() == null) {
            return null;
        }

        Team myTeam = teamMember.get().getTeam();
        Optional<Match> currentMatch = matchRepository.findByTeamIdAndStatusWithTeams(myTeam.getId(), MatchStatus.DUAL);
        if (currentMatch.isEmpty()) {
            return null;
        }

        Match match = currentMatch.get();
        Team opponentTeam = matchRepository.findOpponentTeamByMatchIdAndTeamId(match.getId(), myTeam.getId())
                .orElse(null);

        return CurrentMatchDto.builder()
                .matchId(match.getId())
                .matchDate(match.getMatchDate())
                .startTime(match.getStartTime())
                .location(myTeam.getTitleAddress())
                .myTeamId(myTeam.getId())
                .myTeamName(myTeam.getName())
                .opponentTeamId(opponentTeam != null ? opponentTeam.getId() : null)
                .opponentTeamName(opponentTeam != null ? opponentTeam.getName() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CurrentDualMatchDetailsDto findMyCurrentDualMatchDetails() {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

        Team myTeam = teamRepository.findByMemberUserIdWithMembers(currentUser.getId())
                .orElse(null);
        if (myTeam == null || myTeam.getStatus() != TeamStatus.IN_MATCH) {
            return null;
        }

        Match match = matchRepository.findByTeamIdAndStatusWithTeams(myTeam.getId(), MatchStatus.DUAL)
                .orElse(null);
        if (match == null) {
            return null;
        }

        Team opponentTeam = matchRepository.findOpponentTeamByMatchIdAndTeamId(match.getId(), myTeam.getId())
                .flatMap(opponent -> teamRepository.findByIdWithMembers(opponent.getId()))
                .orElse(null);

        return CurrentDualMatchDetailsDto.builder()
                .matchId(match.getId())
                .matchDate(match.getMatchDate())
                .startTime(match.getStartTime())
                .location(myTeam.getTitleAddress())
                .myTeam(TeamDto.fromEntity(myTeam))
                .opponentTeam(opponentTeam != null ? TeamDto.fromEntity(opponentTeam) : null)
                .build();
    }
}
