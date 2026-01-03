package com.yazzer.foot5connect.dto;

import com.yazzer.foot5connect.models.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class RoleDto {

    private Long id;

    private String name;


    public static RoleDto fromEntity(Role role) {
        if (role == null) {
            return null;
            // TODO throw an exception
        }
        return RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .build();
    }

    public static Role toEntity(RoleDto roleDto) {
        if (roleDto == null) {
            return null;
            // TODO throw an exception
        }
        return Role.builder()
                .id(roleDto.getId())
                .name(roleDto.getName())
                .build();
    }
}
