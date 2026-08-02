package com.yazzer.foot5connect.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yazzer.foot5connect.models.MatchPlayerResult;

public interface MatchPlayerResultRepository extends JpaRepository<MatchPlayerResult, Long> {

    List<MatchPlayerResult> findByMatch_Id(Long matchId);

    List<MatchPlayerResult> findByUser_IdOrderByMatch_MatchDateDescMatch_StartTimeDesc(Long userId);
}
