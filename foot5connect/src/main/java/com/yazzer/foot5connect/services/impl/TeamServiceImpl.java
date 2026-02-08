package com.yazzer.foot5connect.services.impl;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yazzer.foot5connect.dto.TeamDto;
import com.yazzer.foot5connect.models.Team;
import com.yazzer.foot5connect.models.TeamMember;
import com.yazzer.foot5connect.models.TeamStatus;
import com.yazzer.foot5connect.models.User;
import com.yazzer.foot5connect.repositories.TeamMemberRepository;
import com.yazzer.foot5connect.repositories.TeamRepository;
import com.yazzer.foot5connect.repositories.UserRepository;
import com.yazzer.foot5connect.services.TeamService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TeamDto createTeam() {
        User currentUser = getAuthenticatedUser();

        // Vérifier si l'utilisateur a déjà une équipe
        if (teamRepository.findByCaptain_Id(currentUser.getId()).isPresent()) {
            throw new IllegalStateException("L'utilisateur possède déjà une équipe");
        }

        // Créer l'équipe
        Team team = Team.builder()
                .name("donner un nom à votre équipe")
                .captain(currentUser)
                .city(currentUser.getCity())
                .country(currentUser.getCountry())
                .status(TeamStatus.INCOMPLETE)
                .build();
        team = teamRepository.save(team);

        // Ajouter le capitaine comme membre
        TeamMember captain = TeamMember.builder()
                .team(team)
                .user(currentUser)
                .isCaptain(true)
                .build();
        teamMemberRepository.save(captain);

        return TeamDto.fromEntity(team);
    }

    @Override
    public TeamDto findMyTeam() {
        User currentUser = getAuthenticatedUser();
        return teamRepository.findByCaptainIdWithMembers(currentUser.getId())
                .map(TeamDto::fromEntity)
                .orElse(null);
    }

    @Override
    @Transactional
    public TeamDto updateTeam(TeamDto teamDto) {
        User currentUser = getAuthenticatedUser();

        Team team = teamRepository.findByCaptain_Id(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Aucune équipe trouvée"));

        if (teamDto.getName() != null) {
            team.setName(teamDto.getName());
        }
        if (teamDto.getLogoUrl() != null) {
            team.setLogoUrl(teamDto.getLogoUrl());
        }

        team = teamRepository.save(team);

        return TeamDto.fromEntity(
                teamRepository.findByCaptainIdWithMembers(currentUser.getId()).orElse(team)
        );
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new IllegalStateException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof User user) {
            return user;
        }

        if (principal instanceof UserDetails userDetails) {
            return userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new EntityNotFoundException("No user was found with the provided email"));
        }

        throw new IllegalStateException("Unsupported authentication principal");
    }
}
