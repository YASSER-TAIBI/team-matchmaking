package com.yazzer.foot5connect.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import com.yazzer.foot5connect.models.TeamMember;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    boolean existsByUser_Id(Long userId);

    Optional<TeamMember> findByUser_Id(Long userId);

    List<TeamMember> findByTeam_Id(Long teamId);

    List<TeamMember> findByTeam_IdIn(List<Long> teamIds);

    @Modifying
    void deleteByTeam_IdIn(List<Long> teamIds);
}
