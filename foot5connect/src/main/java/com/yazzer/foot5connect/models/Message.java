package com.yazzer.foot5connect.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "messages")
public class Message extends AbstractEntity{

    @Column(nullable = false, length = 1000)
    private String content;

    private LocalDateTime sentAt;

    /* ================= RELATIONS ================= */

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "match_request_id", nullable = false)
    private MatchRequest matchRequest;
}
