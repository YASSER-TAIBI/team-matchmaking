package com.yazzer.foot5connect.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yazzer.foot5connect.models.Match;

public interface MatchRepository extends JpaRepository<Match, Long> {
}
