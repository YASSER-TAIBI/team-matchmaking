package com.yazzer.foot5connect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinishMatchPlayerResultDto {

    private Long userId;
    private boolean played;
    private Integer goals;
}
