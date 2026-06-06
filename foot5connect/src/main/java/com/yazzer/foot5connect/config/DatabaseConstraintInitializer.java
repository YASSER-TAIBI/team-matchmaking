package com.yazzer.foot5connect.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DatabaseConstraintInitializer {

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void updateMatchStatusConstraint() {
        // On supprime l'ancienne contrainte si elle existe encore avec une liste de statuts incomplète.
        jdbcTemplate.execute("ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check");

        // On recrée ensuite la contrainte avec tous les statuts métier réellement supportés par l'enum Java.
        jdbcTemplate.execute("ALTER TABLE matches ADD CONSTRAINT matches_status_check CHECK (status IN ('DUAL', 'ANNULE', 'TERMINE'))");
    }
}
