package com.yazzer.foot5connect.repositories;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yazzer.foot5connect.models.Team;
import com.yazzer.foot5connect.models.TeamStatus;

public interface TeamRepository extends JpaRepository<Team, Long> {

    Optional<Team> findByCaptain_Id(Long captainId);

    @Query("SELECT t FROM Team t LEFT JOIN FETCH t.teamMembers tm LEFT JOIN FETCH tm.user WHERE t.captain.id = :captainId")
    Optional<Team> findByCaptainIdWithMembers(@Param("captainId") Long captainId);

    @Query("SELECT DISTINCT t FROM Team t LEFT JOIN FETCH t.teamMembers tm LEFT JOIN FETCH tm.user WHERE t.id = :teamId")
    Optional<Team> findByIdWithMembers(@Param("teamId") Long teamId);

    @Query("SELECT DISTINCT t FROM Team t LEFT JOIN FETCH t.teamMembers tm LEFT JOIN FETCH tm.user WHERE t.id = (SELECT tm2.team.id FROM TeamMember tm2 WHERE tm2.user.id = :userId)")
    Optional<Team> findByMemberUserIdWithMembers(@Param("userId") Long userId);

    List<Team> findByStatusAndCity(TeamStatus status, String city);
}
