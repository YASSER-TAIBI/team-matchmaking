package com.yazzer.foot5connect.services.impl;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yazzer.foot5connect.dto.CreateTeamInvitationRequest;
import com.yazzer.foot5connect.dto.TeamInvitationDto;
import com.yazzer.foot5connect.models.AvailabilityStatus;
import com.yazzer.foot5connect.models.DisponibilityDetail;
import com.yazzer.foot5connect.models.InvitationStatus;
import com.yazzer.foot5connect.models.InvitationType;
import com.yazzer.foot5connect.models.Match;
import com.yazzer.foot5connect.models.MatchStatus;
import com.yazzer.foot5connect.models.Team;
import com.yazzer.foot5connect.models.TeamInvitation;
import com.yazzer.foot5connect.models.TeamMember;
import com.yazzer.foot5connect.models.TeamStatus;
import com.yazzer.foot5connect.models.User;
import com.yazzer.foot5connect.repositories.DisponibilityDetailRepository;
import com.yazzer.foot5connect.repositories.MatchRepository;
import com.yazzer.foot5connect.repositories.TeamInvitationRepository;
import com.yazzer.foot5connect.repositories.TeamMemberRepository;
import com.yazzer.foot5connect.repositories.TeamRepository;
import com.yazzer.foot5connect.repositories.UserRepository;
import com.yazzer.foot5connect.services.TeamInvitationService;
import com.yazzer.foot5connect.services.auth.AuthenticatedUserService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamInvitationServiceImpl implements TeamInvitationService {

    private final TeamInvitationRepository teamInvitationRepository;
    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final DisponibilityDetailRepository disponibilityDetailRepository;
    private final AuthenticatedUserService authenticatedUserService;

    @Override
    @Transactional
    public TeamInvitationDto createInvitationTeam(CreateTeamInvitationRequest request) {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

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

        User invitedUser = invitedDisponibility.getUser();

        if (invitedUser.getTeamMembers() != null && !invitedUser.getTeamMembers().isEmpty()) {
            throw new IllegalStateException("Ce joueur appartient déjà à une équipe");
        }

        boolean hasPendingInvitation = teamInvitationRepository.existsBySenderTeam_IdAndInvitedUser_IdAndStatusAndType(
                myTeam.getId(),
                invitedUser.getId(),
                InvitationStatus.EN_ATTENTE,
                InvitationType.PLAYER
        );
        if (hasPendingInvitation) {
            throw new IllegalStateException("Une invitation en attente existe déjà pour ce joueur");
        }

        TeamInvitation invitation = TeamInvitation.builder()
                .senderTeam(myTeam)
                .invitedUser(invitedUser)
                .status(InvitationStatus.EN_ATTENTE)
                .availableDate(request.getAvailableDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .type(InvitationType.PLAYER)
                .build();

        TeamInvitation saved = teamInvitationRepository.save(invitation);
        return TeamInvitationDto.fromEntity(saved);
    }

    @Override
    @Transactional
    public TeamInvitationDto createInvitationMatch(CreateTeamInvitationRequest request) {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

        if (request == null
                || request.getInvitedUserId() == null
                || request.getAvailableDate() == null
                || request.getStartTime() == null
                || request.getEndTime() == null) {
            throw new IllegalArgumentException("L'équipe invitée et les horaires proposés sont obligatoires");
        }

        Team myTeam = teamRepository.findByCaptain_Id(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Aucune équipe trouvée pour ce capitaine"));

        if (request.getInvitedUserId().equals(currentUser.getId())) {
            throw new IllegalStateException("Vous ne pouvez pas vous inviter vous-même");
        }

        Team invitedTeam = teamRepository.findByCaptain_Id(request.getInvitedUserId())
                .orElseThrow(() -> new IllegalStateException("Cette équipe n'est pas disponible pour un match"));

        if (!request.getAvailableDate().equals(invitedTeam.getAvailableDate())) {
            throw new IllegalStateException("La date proposée doit correspondre au jour de disponibilité de l'equipe");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalStateException("L'horaire proposé est invalide");
        }

        boolean hasPendingInvitation = teamInvitationRepository.existsBySenderTeam_IdAndReceiverTeam_IdAndStatusAndType(
                myTeam.getId(),
                invitedTeam.getId(),
                InvitationStatus.EN_ATTENTE,
                InvitationType.MATCH
        );
        if (hasPendingInvitation) {
            throw new IllegalStateException("Une invitation en attente existe déjà pour cette equipe");
        }

        User invitedUser = invitedTeam.getCaptain();

        TeamInvitation invitation = TeamInvitation.builder()
                .senderTeam(myTeam)
                .receiverTeam(invitedTeam)
                .invitedUser(invitedUser)
                .status(InvitationStatus.EN_ATTENTE)
                .availableDate(request.getAvailableDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .type(InvitationType.MATCH)
                .build();

        TeamInvitation saved = teamInvitationRepository.save(invitation);
        return TeamInvitationDto.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamInvitationDto> findMyInvitations() {
        User currentUser = authenticatedUserService.getAuthenticatedUser();
        return teamInvitationRepository.findByInvitedUser_IdOrderByCreatedDateDesc(currentUser.getId())
                .stream()
                .map(TeamInvitationDto::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public TeamInvitationDto acceptInvitation(Long invitationId) {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

        TeamInvitation invitation = teamInvitationRepository.findByIdAndInvitedUser_Id(invitationId, currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Invitation introuvable"));

        if (invitation.getStatus() != InvitationStatus.EN_ATTENTE) {
            throw new IllegalStateException("Cette invitation n'est plus en attente");
        }

        if (invitation.getType() == InvitationType.PLAYER && teamMemberRepository.existsByUser_Id(currentUser.getId())) {
            throw new IllegalStateException("Vous appartenez déjà à une équipe");
        }

        if (invitation.getType() == InvitationType.MATCH) {
            Team receiverTeam = invitation.getReceiverTeam();
            if (receiverTeam == null || receiverTeam.getCaptain() == null
                    || !receiverTeam.getCaptain().getId().equals(currentUser.getId())) {
                throw new IllegalStateException("Seul le capitaine de l'équipe invitée peut accepter cette invitation de match");
            }
        }

        invitation.setStatus(InvitationStatus.ACCEPTEE);
        TeamInvitation saved = teamInvitationRepository.save(invitation);

        if (invitation.getType() == InvitationType.PLAYER) {
        TeamMember newMember = TeamMember.builder()
                .team(invitation.getSenderTeam())
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
    } else {
        Team senderTeam = invitation.getSenderTeam();
        Team receiverTeam = invitation.getReceiverTeam();

        if (senderTeam == null || receiverTeam == null) {
            throw new IllegalStateException("Les deux équipes sont obligatoires pour accepter une invitation de match");
        }

        Match match = Match.builder()
                .matchDate(invitation.getAvailableDate())
                .startTime(invitation.getStartTime())
                .location(receiverTeam.getPitchAddress())
                .status(MatchStatus.DUAL)
                .teams(Set.of(senderTeam, receiverTeam))
                .invitation(saved)
                .build();
        matchRepository.save(match);

        senderTeam.setStatus(TeamStatus.IN_MATCH);
        receiverTeam.setStatus(TeamStatus.IN_MATCH);
        teamRepository.save(senderTeam);
        teamRepository.save(receiverTeam);

        return TeamInvitationDto.fromEntity(saved);
    }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamInvitationDto> findMemberInvitations() {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

        Team team = teamRepository.findByCaptain_Id(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Équipe non trouvée"));

         List<TeamInvitation> teamInvitations = teamInvitationRepository.findByReceiverTeam_IdOrderByLastModifiedDateDesc(team.getId());

        return teamInvitations.stream()
                .map(TeamInvitationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeamInvitationDto rejectInvitation(Long invitationId) {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

        TeamInvitation invitation = teamInvitationRepository.findByIdAndInvitedUser_Id(invitationId, currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Invitation introuvable"));

        if (invitation.getStatus() != InvitationStatus.EN_ATTENTE) {
            throw new IllegalStateException("Cette invitation n'est plus en attente");
        }

        invitation.setStatus(InvitationStatus.REFUSEE);
        TeamInvitation saved = teamInvitationRepository.save(invitation);

        return TeamInvitationDto.fromEntity(saved);
    }
}
