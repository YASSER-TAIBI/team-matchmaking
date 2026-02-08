package com.yazzer.foot5connect.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.yazzer.foot5connect.models.PlayerLevel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class AvailablePlayerDto {

    private Long userId;

    private String firstName;

    private String lastName;

    private String country;

    private String city;

    private PlayerLevel level;

    private Integer totalMatches;

    private Integer totalGoals;

    private LocalDate availableDate;

    private LocalTime startTime;

    private LocalTime endTime;
}
