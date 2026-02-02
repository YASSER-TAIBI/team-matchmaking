package com.yazzer.foot5connect.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.yazzer.foot5connect.models.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import com.yazzer.foot5connect.models.DisponibilityDetail;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class DisponibilityDetailDto {
    
    private Long id;

    private Long userId;

    private LocalDate availableDate;

    private LocalTime startTime;
    
    private LocalTime endTime;


    public static DisponibilityDetailDto fromEntity(DisponibilityDetail disponibilityDetail) {
        if (disponibilityDetail == null) {
            return null;
            // TODO throw an exception
        }
        return DisponibilityDetailDto.builder()
                .id(disponibilityDetail.getId())
                .availableDate(disponibilityDetail.getAvailableDate())
                .startTime(disponibilityDetail.getStartTime())
                .endTime(disponibilityDetail.getEndTime())
                .userId(disponibilityDetail.getUser().getId())
                .build();
    }

    public static DisponibilityDetail toEntity(DisponibilityDetailDto disponibilityDetailDto) {
        if (disponibilityDetailDto == null) {
            return null;
            // TODO throw an exception
        }
        return DisponibilityDetail.builder()
                .id(disponibilityDetailDto.getId())
                .availableDate(disponibilityDetailDto.getAvailableDate())
                .startTime(disponibilityDetailDto.getStartTime())
                .endTime(disponibilityDetailDto.getEndTime())
                .user(
                    User.builder()
                        .id(disponibilityDetailDto.getUserId())
                        .build()
                    )
                .build();
    }
}
