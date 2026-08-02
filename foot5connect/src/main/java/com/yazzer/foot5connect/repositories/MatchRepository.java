package com.yazzer.foot5connect.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import com.yazzer.foot5connect.models.Match;
import com.yazzer.foot5connect.models.MatchStatus;
import com.yazzer.foot5connect.models.Team;

public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query("SELECT DISTINCT m FROM Match m JOIN FETCH m.matchTeams mt JOIN FETCH mt.team WHERE mt.team.id = :teamId AND m.status = :status")
    Optional<Match> findByTeamIdAndStatusWithTeams(@Param("teamId") Long teamId, @Param("status") MatchStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT DISTINCT m FROM Match m JOIN FETCH m.matchTeams fetchedMatchTeams JOIN FETCH fetchedMatchTeams.team WHERE m.id IN (SELECT DISTINCT lockedMatch.id FROM Match lockedMatch JOIN lockedMatch.matchTeams filteredMatchTeam WHERE filteredMatchTeam.team.id = :teamId AND lockedMatch.status = :status)")
    Optional<Match> findByTeamIdAndStatusWithTeamsForUpdate(@Param("teamId") Long teamId, @Param("status") MatchStatus status);

    @Query("SELECT mt.team FROM Match m JOIN m.matchTeams mt WHERE m.id = :matchId AND mt.team.id <> :teamId")
    Optional<Team> findOpponentTeamByMatchIdAndTeamId(@Param("matchId") Long matchId, @Param("teamId") Long teamId);
}
