package com.yazzer.foot5connect.services.impl;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import com.yazzer.foot5connect.services.CloudinaryMediaService;
import com.yazzer.foot5connect.services.TeamService;
import com.yazzer.foot5connect.services.auth.AuthenticatedUserService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private static final Logger log = LoggerFactory.getLogger(TeamServiceImpl.class);

    private final TeamRepository teamRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final CloudinaryMediaService cloudinaryMediaService;

    @Override
    @Transactional
    public TeamDto createTeam() {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

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
                .matchesCanceled(0)
                .teamLevel(AvailabilityTeamLevel.AMATEUR)
                .isAnnuleMatch(false)
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
        User currentUser = authenticatedUserService.getAuthenticatedUser();
        return teamRepository.findByCaptainIdWithMembers(currentUser.getId())
                .map(TeamDto::fromEntity)
                .orElse(null);
    }

    @Override
    public TeamDto findMyMemberTeam() {
        User currentUser = authenticatedUserService.getAuthenticatedUser();
        return teamRepository.findByMemberUserIdWithMembers(currentUser.getId())
                .map(TeamDto::fromEntity)
                .orElse(null);
    }

    @Override
    public boolean hasMyTeamMembership() {
        User currentUser = authenticatedUserService.getAuthenticatedUser();
        return teamMemberRepository.existsByUser_Id(currentUser.getId());
    }

    // Met à jour les informations de l'équipe du capitaine connecté.
    // Pour le logo, le backend lit d'abord l'ancien logo_url en base,
    // supprime l'ancien asset Cloudinary s'il appartient au dossier teams,
    // puis enregistre la nouvelle URL du logo dans la table teams.
    @Override
    @Transactional
    public TeamDto updateTeam(TeamDto teamDto) {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

        Team team = teamRepository.findByCaptain_Id(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Aucune équipe trouvée"));

        if (teamDto.getName() != null) {
            team.setName(teamDto.getName());
        }
        if (teamDto.getLogoUrl() != null) {
            String previousLogoUrl = team.getLogoUrl();
            String nextLogoUrl = teamDto.getLogoUrl();
            log.info("Mise à jour logo demandée. previousLogoUrl={}, nextLogoUrl={}", previousLogoUrl, nextLogoUrl);
            team.setLogoUrl(teamDto.getLogoUrl());
            if (previousLogoUrl != null
                    && !previousLogoUrl.equals(nextLogoUrl)) {
                try {
                    log.info("Tentative de suppression de l'ancien logo Cloudinary. previousLogoUrl={}, nextLogoUrl={}", previousLogoUrl, nextLogoUrl);
                    cloudinaryMediaService.deleteAssetByUrl(previousLogoUrl);
                } catch (RuntimeException exception) {
                    log.warn("La suppression de l'ancien logo a échoué mais la mise à jour de l'équipe continue. previousLogoUrl={}", previousLogoUrl, exception);
                }
            } else {
                log.info("Suppression Cloudinary non déclenchée. previousLogoUrl est null ou identique au nouveau logo. previousLogoUrl={}, nextLogoUrl={}", previousLogoUrl, nextLogoUrl);
            }
        } else {
            log.info("Aucune mise à jour de logo demandée dans cette requête updateTeam.");
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
        if (teamDto.getFormation() != null) {
            team.setFormation(teamDto.getFormation());
        }
        if (teamDto.getTarificationTerrain() != null) {
            team.setTarificationTerrain(teamDto.getTarificationTerrain());
        }
        if (teamDto.getIsAnnuleMatch() != null) {
            team.setIsAnnuleMatch(teamDto.getIsAnnuleMatch());
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
        User currentUser = authenticatedUserService.getAuthenticatedUser();
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
        User currentUser = authenticatedUserService.getAuthenticatedUser();

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

        List<TeamInvitation> pendingInvitations = teamInvitationRepository.findBySenderTeam_IdAndStatus(teamId, InvitationStatus.EN_ATTENTE);
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
        User currentUser = authenticatedUserService.getAuthenticatedUser();

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
        User currentUser = authenticatedUserService.getAuthenticatedUser();

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

}
