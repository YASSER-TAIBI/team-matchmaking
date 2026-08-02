package com.yazzer.foot5connect.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yazzer.foot5connect.models.MatchTeam;

public interface MatchTeamRepository extends JpaRepository<MatchTeam, Long> {

    List<MatchTeam> findByMatch_Id(Long matchId);

    Optional<MatchTeam> findByMatch_IdAndTeam_Id(Long matchId, Long teamId);
}
