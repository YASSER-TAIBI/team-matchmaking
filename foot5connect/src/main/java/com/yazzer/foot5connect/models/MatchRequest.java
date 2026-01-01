package com.yazzer.foot5connect.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "match_requests")
public class MatchRequest  extends AbstractEntity {

    @Column(nullable = false)
    private LocalDate matchDate;

    @Column(nullable = false)
    private String timeSlot;

    @Enumerated(EnumType.STRING)
    private MatchRequestStatus status;


    /* ================= RELATIONS ================= */

    @OneToOne
    @JoinColumn(name = "team_id", unique = true, nullable = false)
    private Team team;

    @OneToMany(mappedBy = "matchRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages;

    @OneToOne(mappedBy = "matchRequest")
    private Match match;
}
