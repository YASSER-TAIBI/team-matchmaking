package com.yazzer.foot5connect.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yazzer.foot5connect.models.TeamMember;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {

    boolean existsByUser_Id(Long userId);
}
