package com.yazzer.foot5connect.repositories;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yazzer.foot5connect.models.DisponibilityDetail;

public interface DisponibilityDetailRepository extends JpaRepository<DisponibilityDetail, Long> {

    boolean existsByUser_IdAndAvailableDateAndStartTimeAndEndTime(Long userId, LocalDate availableDate, LocalTime startTime, LocalTime endTime);
}
