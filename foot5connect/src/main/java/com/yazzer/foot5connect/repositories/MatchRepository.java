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

    @Query("SELECT DISTINCT m FROM Match m JOIN m.teams team WHERE team.id = :teamId AND m.status = :status")
    Optional<Match> findByTeamIdAndStatusWithTeams(@Param("teamId") Long teamId, @Param("status") MatchStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    // On verrouille le match courant pour éviter qu'une double confirmation simultanée exécute deux fois l'annulation complète.
    // La sous-requête sert à identifier le bon match via l'équipe courante, puis le JOIN FETCH recharge les deux équipes du match.
    @Query("SELECT DISTINCT m FROM Match m JOIN FETCH m.teams fetchedTeams WHERE m.id IN (SELECT DISTINCT lockedMatch.id FROM Match lockedMatch JOIN lockedMatch.teams filteredTeam WHERE filteredTeam.id = :teamId AND lockedMatch.status = :status)")
    Optional<Match> findByTeamIdAndStatusWithTeamsForUpdate(@Param("teamId") Long teamId, @Param("status") MatchStatus status);

    @Query("SELECT t FROM Match m JOIN m.teams t WHERE m.id = :matchId AND t.id <> :teamId")
    Optional<Team> findOpponentTeamByMatchIdAndTeamId(@Param("matchId") Long matchId, @Param("teamId") Long teamId);
}
