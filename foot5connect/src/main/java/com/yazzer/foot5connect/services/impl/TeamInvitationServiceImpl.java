package com.yazzer.foot5connect.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yazzer.foot5connect.dto.CreateTeamInvitationRequest;
import com.yazzer.foot5connect.dto.TeamInvitationDto;
import com.yazzer.foot5connect.models.AvailabilityStatus;
import com.yazzer.foot5connect.models.DisponibilityDetail;
import com.yazzer.foot5connect.models.InvitationStatus;
import com.yazzer.foot5connect.models.Team;
import com.yazzer.foot5connect.models.TeamInvitation;
import com.yazzer.foot5connect.models.TeamMember;
import com.yazzer.foot5connect.models.User;
import com.yazzer.foot5connect.repositories.DisponibilityDetailRepository;
import com.yazzer.foot5connect.repositories.TeamInvitationRepository;
import com.yazzer.foot5connect.repositories.TeamMemberRepository;
import com.yazzer.foot5connect.repositories.TeamRepository;
import com.yazzer.foot5connect.repositories.UserRepository;
import com.yazzer.foot5connect.services.TeamInvitationService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamInvitationServiceImpl implements TeamInvitationService {

    private final TeamInvitationRepository teamInvitationRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final DisponibilityDetailRepository disponibilityDetailRepository;

    @Override
    @Transactional
    public TeamInvitationDto createInvitation(CreateTeamInvitationRequest request) {
        User currentUser = getAuthenticatedUser();

        if (request == null
                || request.getInvitedUserId() == null
                || request.getAvailableDate() == null
                || request.getStartTime() == null
                || request.getEndTime() == null) {
            throw new IllegalArgumentException("Le joueur invité et les horaires proposés sont obligatoires");
        }

        Team myTeam = teamRepository.findByCaptain_Id(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Aucune équipe trouvée pour ce capitaine"));

        if (request.getInvitedUserId().equals(currentUser.getId())) {
            throw new IllegalStateException("Vous ne pouvez pas vous inviter vous-même");
        }

        List<DisponibilityDetail> playersInMyLocation = disponibilityDetailRepository
                .findLatestDisponibilityForAvailableUsersInLocation(currentUser.getCountry(), currentUser.getCity());

        DisponibilityDetail invitedDisponibility = playersInMyLocation.stream()
                .filter(d -> d.getUser() != null && request.getInvitedUserId().equals(d.getUser().getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Ce joueur n'est pas dans la liste des joueurs disponibles de votre zone"));

        if (!request.getAvailableDate().equals(invitedDisponibility.getAvailableDate())) {
            throw new IllegalStateException("La date proposée doit correspondre au jour de disponibilité du joueur");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalStateException("L'horaire proposé est invalide");
        }

        if (request.getStartTime().isBefore(invitedDisponibility.getStartTime())
                || request.getEndTime().isAfter(invitedDisponibility.getEndTime())) {
            throw new IllegalStateException("L'horaire proposé doit être dans la plage de disponibilité du joueur");
        }

        User invitedUser = invitedDisponibility.getUser();

        if (invitedUser.getTeamMembers() != null && !invitedUser.getTeamMembers().isEmpty()) {
            throw new IllegalStateException("Ce joueur appartient déjà à une équipe");
        }

        boolean hasPendingInvitation = teamInvitationRepository.existsByTeam_IdAndInvitedUser_IdAndStatus(
                myTeam.getId(),
                invitedUser.getId(),
                InvitationStatus.EN_ATTENTE
        );
        if (hasPendingInvitation) {
            throw new IllegalStateException("Une invitation en attente existe déjà pour ce joueur");
        }

        TeamInvitation invitation = TeamInvitation.builder()
                .team(myTeam)
                .invitedUser(invitedUser)
                .status(InvitationStatus.EN_ATTENTE)
                .availableDate(request.getAvailableDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        TeamInvitation saved = teamInvitationRepository.save(invitation);
        return TeamInvitationDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamInvitationDto> findMyInvitations() {
        User currentUser = getAuthenticatedUser();
        return teamInvitationRepository.findByInvitedUser_IdOrderByCreatedDateDesc(currentUser.getId())
                .stream()
                .map(TeamInvitationDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public TeamInvitationDto acceptInvitation(Long invitationId) {
        User currentUser = getAuthenticatedUser();

        TeamInvitation invitation = teamInvitationRepository.findByIdAndInvitedUser_Id(invitationId, currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Invitation introuvable"));

        if (invitation.getStatus() != InvitationStatus.EN_ATTENTE) {
            throw new IllegalStateException("Cette invitation n'est plus en attente");
        }

        if (teamMemberRepository.existsByUser_Id(currentUser.getId())) {
            throw new IllegalStateException("Vous appartenez déjà à une équipe");
        }

        invitation.setStatus(InvitationStatus.ACCEPTEE);
        TeamInvitation saved = teamInvitationRepository.save(invitation);

        TeamMember newMember = TeamMember.builder()
                .team(invitation.getTeam())
                .user(currentUser)
                .isCaptain(false)
                .build();
        teamMemberRepository.save(newMember);

        currentUser.setAvailabilityStatus(AvailabilityStatus.EN_EQUIPE);
        userRepository.save(currentUser);

        List<TeamInvitation> otherInvitations = teamInvitationRepository.findByInvitedUser_IdAndIdNot(currentUser.getId(), invitationId);
        for (TeamInvitation otherInvitation : otherInvitations) {
            if (otherInvitation.getStatus() == InvitationStatus.EN_ATTENTE) {
                otherInvitation.setStatus(InvitationStatus.REFUSEE);
            }
        }
        teamInvitationRepository.saveAll(otherInvitations);

        return TeamInvitationDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamInvitationDto> findMemberInvitations() {
        User currentUser = getAuthenticatedUser();

        Team team = teamRepository.findByCaptain_Id(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Équipe non trouvée"));

        List<TeamInvitation> teamInvitations = teamInvitationRepository.findByTeam_Id(team.getId());

        return teamInvitations.stream()
                .map(TeamInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeamInvitationDto rejectInvitation(Long invitationId) {
        User currentUser = getAuthenticatedUser();

        TeamInvitation invitation = teamInvitationRepository.findByIdAndInvitedUser_Id(invitationId, currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Invitation introuvable"));

        if (invitation.getStatus() != InvitationStatus.EN_ATTENTE) {
            throw new IllegalStateException("Cette invitation n'est plus en attente");
        }

        invitation.setStatus(InvitationStatus.REFUSEE);
        TeamInvitation saved = teamInvitationRepository.save(invitation);

        return TeamInvitationDto.fromEntity(saved);
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
