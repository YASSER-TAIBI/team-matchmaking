package com.yazzer.foot5connect.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true, exclude = {"teamMembers", "captain", "matchTeams", "sentInvitations", "receivedInvitations"})
@ToString(callSuper = true, exclude = {"teamMembers", "captain", "matchTeams", "sentInvitations", "receivedInvitations"})
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

    @Column(nullable = false)
    private Integer totalMatches;

    @Column(nullable = false)
    private Integer matchesWon;
    
    @Column(nullable = false)
    private Integer matchesLost;

    @Column(nullable = false)
    private Integer matchesDrawn;

    @Column(nullable = false)
    private Integer matchesCanceled;

    @Enumerated(EnumType.STRING)
    private AvailabilityTeamLevel teamLevel;

    @Column(name = "available_date")
    private LocalDate availableDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "pitch_address")
    private String pitchAddress;

    @Column(name = "title_address")
    private String titleAddress;

    private String formation;

    private BigDecimal prix;

    private Boolean isAnnuleMatch;

    @Enumerated(EnumType.STRING)
    private TarificationTerrain tarificationTerrain;

    /* ================= RELATIONS ================= */

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamMember> teamMembers;

    @OneToOne
    @JoinColumn(name = "captain_id", nullable = false)
    private User captain;

    @OneToMany(mappedBy = "team")
    private List<MatchTeam> matchTeams;

    @OneToMany(mappedBy = "senderTeam")
    private List<TeamInvitation> sentInvitations;

    @OneToMany(mappedBy = "receiverTeam")
    private List<TeamInvitation> receivedInvitations;
}
