package com.yazzer.foot5connect.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table( name = "disponibility_details",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "available_date", "start_time", "end_time"}
    )
)
public class DisponibilityDetail extends AbstractEntity {

    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    /* ================= RELATIONS ================= */

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
