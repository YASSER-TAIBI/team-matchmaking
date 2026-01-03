package com.yazzer.foot5connect.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Entity
@Table(name = "users")
public class User extends AbstractEntity {

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;

    private String lastName;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String city;

    @Enumerated(EnumType.STRING)
    private AvailabilityStatus availabilityStatus;

    private boolean active;


    /* ================= RELATIONS ================= */

    @OneToMany(mappedBy = "user")
    private List<TeamMember> teamMembers;

    @OneToMany(mappedBy = "sender")
    private List<Message> messages;

    @ManyToOne
    @JoinColumn(name = "id_role") // tu gardes la colonne existante
    private Role role;
}
