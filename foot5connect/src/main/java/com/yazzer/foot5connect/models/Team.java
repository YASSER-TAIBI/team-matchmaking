package com.yazzer.foot5connect.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "teams")
public class Team extends AbstractEntity {

    @Column(nullable = false)
    private String name;

    private String logoUrl;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String city;

    @Enumerated(EnumType.STRING)
    private TeamStatus status;

    /* ================= RELATIONS ================= */

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> teamMembers;

    @OneToOne
    @JoinColumn(name = "captain_id", nullable = false)
    private User captain;

    @OneToOne(mappedBy = "team", cascade = CascadeType.ALL)
    private MatchRequest matchRequest;

    @ManyToMany(mappedBy = "teams")
    private Set<Match> matches;
}
