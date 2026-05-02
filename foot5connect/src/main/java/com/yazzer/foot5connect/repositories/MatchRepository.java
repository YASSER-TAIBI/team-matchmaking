package com.yazzer.foot5connect.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yazzer.foot5connect.models.Match;
import com.yazzer.foot5connect.models.MatchStatus;
import com.yazzer.foot5connect.models.Team;

public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query("SELECT DISTINCT m FROM Match m JOIN m.teams team WHERE team.id = :teamId AND m.status = :status")
    Optional<Match> findByTeamIdAndStatusWithTeams(@Param("teamId") Long teamId, @Param("status") MatchStatus status);

    @Query("SELECT t FROM Match m JOIN m.teams t WHERE m.id = :matchId AND t.id <> :teamId")
    Optional<Team> findOpponentTeamByMatchIdAndTeamId(@Param("matchId") Long matchId, @Param("teamId") Long teamId);
}
