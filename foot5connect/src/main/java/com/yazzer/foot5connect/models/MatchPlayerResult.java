package com.yazzer.foot5connect.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true, exclude = {"match", "team", "user"})
@ToString(callSuper = true, exclude = {"match", "team", "user"})
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(
        name = "match_player_results",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"match_id", "user_id"})
        }
)
public class MatchPlayerResult extends AbstractEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "player_name")
    private String playerName;

    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    @Enumerated(EnumType.STRING)
    private PlayerPosition position;

    @Enumerated(EnumType.STRING)
    private PlayerSelection selection;

    @Column(nullable = false)
    private boolean captain;

    @Column(nullable = false)
    private boolean played;

    @Column(nullable = false)
    private Integer goals;
}
