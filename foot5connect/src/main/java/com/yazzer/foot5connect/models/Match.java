package com.yazzer.foot5connect.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "matches")
public class Match extends AbstractEntity{

    private LocalDate matchDate;
    private LocalTime startTime;
    private String location;

    @Enumerated(EnumType.STRING)
    private MatchStatus status;

    private Integer scoreTeamA;
    private Integer scoreTeamB;


    /* ================= RELATIONS ================= */

    @ManyToMany
    @JoinTable(
            name = "match_teams",
            joinColumns = @JoinColumn(name = "match_id"),
            inverseJoinColumns = @JoinColumn(name = "team_id")
    )
    private Set<Team> teams;

    @OneToOne
    @JoinColumn(name = "match_request_id", unique = true)
    private MatchRequest matchRequest;
}
