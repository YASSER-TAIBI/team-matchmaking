package com.yazzer.foot5connect.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        name = "team_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "team_id"})
        }
)
public class TeamMember extends AbstractEntity {

    private Integer jerseyNumber;

    @Enumerated(EnumType.STRING)
    private PlayerPosition position;

    @Column(nullable = false)
    private boolean isCaptain;


    /* ================= RELATIONS ================= */

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
}
