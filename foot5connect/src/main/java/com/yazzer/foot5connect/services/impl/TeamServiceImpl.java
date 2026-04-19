package com.yazzer.foot5connect.services.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yazzer.foot5connect.dto.TeamDto;
import com.yazzer.foot5connect.dto.TeamMemberDto;
import com.yazzer.foot5connect.models.AvailabilityStatus;
import com.yazzer.foot5connect.models.AvailabilityTeamLevel;
import com.yazzer.foot5connect.models.InvitationStatus;
import com.yazzer.foot5connect.models.PlayerSelection;
import com.yazzer.foot5connect.models.Team;
import com.yazzer.foot5connect.models.TeamInvitation;
import com.yazzer.foot5connect.models.TeamMember;
import com.yazzer.foot5connect.models.TeamStatus;
import com.yazzer.foot5connect.models.User;
import com.yazzer.foot5connect.repositories.TeamInvitationRepository;
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
    private final TeamInvitationRepository teamInvitationRepository;
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
                .totalMatches(0)
                .matchesWon(0)
                .matchesLost(0)
                .matchesDrawn(0)
                .teamLevel(AvailabilityTeamLevel.AMATEUR)
                .build();
        team = teamRepository.save(team);

        // Ajouter le capitaine comme membre
        TeamMember captain = TeamMember.builder()
                .team(team)
                .user(currentUser)
                .isCaptain(true)
                .selection(PlayerSelection.STARTER)
                .build();
        teamMemberRepository.save(captain);

        // Mettre à jour le statut de l'utilisateur
        currentUser.setAvailabilityStatus(AvailabilityStatus.EN_EQUIPE);
        userRepository.save(currentUser);

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
    public TeamDto findMyMemberTeam() {
        User currentUser = getAuthenticatedUser();
        return teamRepository.findByMemberUserIdWithMembers(currentUser.getId())
                .map(TeamDto::fromEntity)
                .orElse(null);
    }

    @Override
    public boolean hasMyTeamMembership() {
        User currentUser = getAuthenticatedUser();
        return teamMemberRepository.existsByUser_Id(currentUser.getId());
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
        if (teamDto.getStatus() != null) {
            team.setStatus(teamDto.getStatus());
        }
        if (teamDto.getTeamLevel() != null) {
            team.setTeamLevel(teamDto.getTeamLevel());
        }
        if (teamDto.getAvailableDate() != null) {
            team.setAvailableDate(teamDto.getAvailableDate());
        }
        if (teamDto.getStartTime() != null) {
            team.setStartTime(teamDto.getStartTime());
        }
        if (teamDto.getEndTime() != null) {
            team.setEndTime(teamDto.getEndTime());
        }
        if (teamDto.getPitchAddress() != null) {
            team.setPitchAddress(teamDto.getPitchAddress());
        }
        if (teamDto.getTitleAddress() != null) {
            team.setTitleAddress(teamDto.getTitleAddress());
        }
        if (teamDto.getPrix() != null) {
            team.setPrix(teamDto.getPrix());
        }
        if (teamDto.getTarificationTerrain() != null) {
            team.setTarificationTerrain(teamDto.getTarificationTerrain());
        }
        if (teamDto.getMembers() != null) {
            List<TeamMember> teamMembers = teamMemberRepository.findByTeam_Id(team.getId());

            for (TeamMember member : teamMembers) {
                Optional<TeamMemberDto> matchingMember = teamDto.getMembers().stream()
                        .filter(memberDto -> memberDto.getId() != null && memberDto.getId().equals(member.getId()))
                        .findFirst();

                if (matchingMember.isEmpty()) {
                    matchingMember = teamDto.getMembers().stream()
                            .filter(memberDto -> memberDto.getUserId() != null
                                    && member.getUser() != null
                                    && memberDto.getUserId().equals(member.getUser().getId()))
                            .findFirst();
                }

                matchingMember.ifPresent(memberDto -> {
                    member.setJerseyNumber(memberDto.getJerseyNumber());
                    member.setPosition(memberDto.getPosition());
                    member.setSelection(memberDto.getSelection());
                });
            }

            teamMemberRepository.saveAll(teamMembers);
        }

        team = teamRepository.save(team);

        return TeamDto.fromEntity(
                teamRepository.findByCaptainIdWithMembers(currentUser.getId()).orElse(team)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamDto> findCompleteTeamsInMyCity() {
        User currentUser = getAuthenticatedUser();
        String city = currentUser.getCity();
        System.out.println("DEBUG city=[" + city + "]");

        if (city == null || city.isBlank()) {
            return List.of();
        }

        List<Team> teams = teamRepository.findByStatusAndCity(TeamStatus.COMPLETE, city);
        System.out.println("DEBUG teams.size=" + teams.size());

        return teams
                .stream()
                .map(TeamDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public void leaveMyTeam() {
        User currentUser = getAuthenticatedUser();

        TeamMember teamMember = teamMemberRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Aucun membre d'équipe trouvé pour cet utilisateur"));

        Team team = teamMember.getTeam();
        Long teamId = team.getId();

        List<TeamMember> teamMembers = teamMemberRepository.findByTeam_Id(teamId);
        if (teamMembers.isEmpty()) {
            throw new EntityNotFoundException("Aucun membre trouvé pour cette équipe");
        }

        List<User> usersToUpdate = teamMembers.stream()
                .map(TeamMember::getUser)
                .toList();

        teamMemberRepository.deleteAll(teamMembers);

        for (User user : usersToUpdate) {
            user.setAvailabilityStatus(AvailabilityStatus.INDISPONIBLE);
        }
        userRepository.saveAll(usersToUpdate);

        List<TeamInvitation> pendingInvitations = teamInvitationRepository.findByTeam_IdAndStatus(teamId, InvitationStatus.EN_ATTENTE);
        for (TeamInvitation invitation : pendingInvitations) {
            invitation.setStatus(InvitationStatus.ANNULLEE);
        }
        teamInvitationRepository.saveAll(pendingInvitations);

        team.setStatus(TeamStatus.INACTIVE);
        team.setAvailableDate(null);
        team.setStartTime(null);
        team.setEndTime(null);
        teamRepository.save(team);
    }

    @Override
    @Transactional
    public void rejoinMyTeam() {
        User currentUser = getAuthenticatedUser();

        if (teamMemberRepository.existsByUser_Id(currentUser.getId())) {
            throw new IllegalStateException("Cet utilisateur appartient déjà à une équipe");
        }

        Team team = teamRepository.findByCaptain_Id(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Aucune équipe trouvée"));

        // Ajouter le capitaine comme membre
        TeamMember captain = TeamMember.builder()
                .team(team)
                .user(currentUser)
                .isCaptain(true)
                .selection(PlayerSelection.STARTER)
                .build();
        teamMemberRepository.save(captain);

        team.setStatus(TeamStatus.INCOMPLETE);
        teamRepository.save(team);

        // Mettre à jour le statut de l'utilisateur
        currentUser.setAvailabilityStatus(AvailabilityStatus.EN_EQUIPE);
        userRepository.save(currentUser);
    }

    @Override
    @Transactional
    public void removeMemberFromMyTeam(Long userId) {
        User currentUser = getAuthenticatedUser();

        Team team = teamRepository.findByCaptain_Id(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Aucune équipe trouvée"));

        TeamMember memberToRemove = teamMemberRepository.findByUser_Id(userId)
                .orElseThrow(() -> new EntityNotFoundException("Aucun membre trouvé pour cet utilisateur"));

        if (!memberToRemove.getTeam().getId().equals(team.getId())) {
            throw new IllegalStateException("Ce joueur n'appartient pas à votre équipe");
        }

        teamMemberRepository.delete(memberToRemove);

        User userToUpdate = memberToRemove.getUser();
        userToUpdate.setAvailabilityStatus(AvailabilityStatus.INDISPONIBLE);
        userRepository.save(userToUpdate);
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
