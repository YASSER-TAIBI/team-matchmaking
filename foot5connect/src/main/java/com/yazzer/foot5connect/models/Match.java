package com.yazzer.foot5connect.models;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true, exclude = {"matchTeams", "playerResults", "invitation"})
@ToString(callSuper = true, exclude = {"matchTeams", "playerResults", "invitation"})
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "matches")
public class Match extends AbstractEntity {

    @Column(name = "match_date")
    private LocalDate matchDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    private String location;

    @Enumerated(EnumType.STRING)
    private MatchStatus status;

    @Column(length = 1000)
    private String notes;

    @Column(name = "pitch_address")
    private String pitchAddress;

    @Column(name = "title_address")
    private String titleAddress;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "tarification_terrain")
    private TarificationTerrain tarificationTerrain;

    /* ================= RELATIONS ================= */

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MatchTeam> matchTeams;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MatchPlayerResult> playerResults;

    @OneToOne
    @JoinColumn(name = "invitation_id", unique = true)
    private TeamInvitation invitation;
}
