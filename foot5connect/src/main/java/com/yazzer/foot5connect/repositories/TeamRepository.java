package com.yazzer.foot5connect.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yazzer.foot5connect.models.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {

    Optional<Team> findByCaptain_Id(Long captainId);

    @Query("SELECT t FROM Team t LEFT JOIN FETCH t.teamMembers tm LEFT JOIN FETCH tm.user WHERE t.captain.id = :captainId")
    Optional<Team> findByCaptainIdWithMembers(@Param("captainId") Long captainId);
}
