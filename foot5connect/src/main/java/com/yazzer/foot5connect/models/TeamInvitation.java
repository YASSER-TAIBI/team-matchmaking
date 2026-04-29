package com.yazzer.foot5connect.models;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "team_invitations")
public class TeamInvitation extends AbstractEntity {
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status;

    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;
    
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationType type;

    /* ================= RELATIONS ================= */

    // équipe qui envoie l'invitation
    @ManyToOne
    @JoinColumn(name = "sender_team_id", nullable = false)
    private Team senderTeam;

    // équipe cible (uniquement pour MATCH)
    @ManyToOne
    @JoinColumn(name = "receiver_team_id")
    private Team receiverTeam;

    // joueur invité (uniquement pour PLAYER)
    @ManyToOne
    @JoinColumn(name = "invited_user_id")
    private User invitedUser;

    // match créé suite à l’acceptation
    @OneToOne(mappedBy = "invitation", cascade = CascadeType.ALL)
    private Match match;
}
