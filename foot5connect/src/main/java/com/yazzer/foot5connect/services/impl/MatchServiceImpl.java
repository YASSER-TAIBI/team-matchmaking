package com.yazzer.foot5connect.services.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yazzer.foot5connect.dto.CurrentDualMatchDetailsDto;
import com.yazzer.foot5connect.dto.CurrentMatchDto;
import com.yazzer.foot5connect.dto.TeamDto;
import com.yazzer.foot5connect.models.AvailabilityStatus;
import com.yazzer.foot5connect.models.Match;
import com.yazzer.foot5connect.models.MatchStatus;
import com.yazzer.foot5connect.models.Team;
import com.yazzer.foot5connect.models.TeamMember;
import com.yazzer.foot5connect.models.TeamStatus;
import com.yazzer.foot5connect.models.User;
import com.yazzer.foot5connect.repositories.MatchRepository;
import com.yazzer.foot5connect.repositories.TeamMemberRepository;
import com.yazzer.foot5connect.repositories.TeamRepository;
import com.yazzer.foot5connect.repositories.UserRepository;
import com.yazzer.foot5connect.services.MatchService;
import com.yazzer.foot5connect.services.auth.AuthenticatedUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final AuthenticatedUserService authenticatedUserService;

    @Override
    @Transactional(readOnly = true)
    public CurrentMatchDto findMyCurrentMatch() {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

        Optional<TeamMember> teamMember = teamMemberRepository.findByUser_Id(currentUser.getId());
        if (teamMember.isEmpty() || teamMember.get().getTeam() == null) {
            return null;
        }

        Team myTeam = teamMember.get().getTeam();
        Optional<Match> currentMatch = matchRepository.findByTeamIdAndStatusWithTeams(myTeam.getId(), MatchStatus.DUAL);
        if (currentMatch.isEmpty()) {
            return null;
        }

        Match match = currentMatch.get();
        Team opponentTeam = matchRepository.findOpponentTeamByMatchIdAndTeamId(match.getId(), myTeam.getId())
                .orElse(null);

        return CurrentMatchDto.builder()
                .matchId(match.getId())
                .matchDate(match.getMatchDate())
                .startTime(match.getStartTime())
                .location(myTeam.getTitleAddress())
                .myTeamId(myTeam.getId())
                .myTeamName(myTeam.getName())
                .myTeamLogoUrl(myTeam.getLogoUrl())
                .opponentTeamId(opponentTeam != null ? opponentTeam.getId() : null)
                .opponentTeamName(opponentTeam != null ? opponentTeam.getName() : null)
                .opponentTeamLogoUrl(opponentTeam != null ? opponentTeam.getLogoUrl() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CurrentDualMatchDetailsDto findMyCurrentDualMatchDetails() {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

        Team myTeam = teamRepository.findByMemberUserIdWithMembers(currentUser.getId())
                .orElse(null);
        if (myTeam == null || myTeam.getStatus() != TeamStatus.IN_MATCH) {
            return null;
        }

        Match match = matchRepository.findByTeamIdAndStatusWithTeams(myTeam.getId(), MatchStatus.DUAL)
                .orElse(null);
        if (match == null) {
            return null;
        }

        Team opponentTeam = matchRepository.findOpponentTeamByMatchIdAndTeamId(match.getId(), myTeam.getId())
                .flatMap(opponent -> teamRepository.findByIdWithMembers(opponent.getId()))
                .orElse(null);

        return CurrentDualMatchDetailsDto.builder()
                .matchId(match.getId())
                .matchDate(match.getMatchDate())
                .startTime(match.getStartTime())
                .location(myTeam.getTitleAddress())
                .myTeam(TeamDto.fromEntity(myTeam))
                .opponentTeam(opponentTeam != null ? TeamDto.fromEntity(opponentTeam) : null)
                .build();
    }

    @Override
    @Transactional
    public CurrentDualMatchDetailsDto confirmCurrentDualMatchCancellation(boolean confirmed) {
        User currentUser = authenticatedUserService.getAuthenticatedUser();

        // On récupère l'équipe actuelle de l'utilisateur connecté pour savoir quelle équipe confirme l'annulation.
        Team myTeam = teamRepository.findByMemberUserIdWithMembers(currentUser.getId())
                .orElse(null);

        // Si l'utilisateur n'est plus dans une équipe en match, l'appel devient idempotent et ne fait rien.
        if (myTeam == null || myTeam.getStatus() != TeamStatus.IN_MATCH) {
            return null;
        }

        // On verrouille le match courant pour empêcher une double annulation si les deux capitaines confirment presque en même temps.
        Match match = matchRepository.findByTeamIdAndStatusWithTeamsForUpdate(myTeam.getId(), MatchStatus.DUAL)
                .orElse(null);

        // Si aucun match DUAL n'est trouvé, cela veut dire qu'il a déjà été annulé ou qu'il n'existe plus dans cet état.
        if (match == null) {
            return null;
        }

        // Un dual match valide doit toujours avoir exactement deux équipes.
        List<Team> teams = new ArrayList<>(match.getTeams());
        if (teams.size() != 2) {
            throw new IllegalStateException("Le match courant doit contenir exactement deux équipes");
        }

        // On récupère l'équipe courante directement depuis les équipes du match verrouillé.
        Team persistedMyTeam = teams.stream()
                .filter(team -> team.getId().equals(myTeam.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Votre équipe n'est pas rattachée au match courant"));

        // L'autre équipe du match est forcément l'équipe adverse.
        Team opponentTeam = teams.stream()
                .filter(team -> !team.getId().equals(myTeam.getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("L'équipe adverse du match courant est introuvable"));

        // On enregistre la décision du capitaine courant : confirmer ou retirer sa demande d'annulation.
        persistedMyTeam.setIsAnnuleMatch(confirmed);

        // L'annulation complète ne peut partir que lorsque les deux équipes ont confirmé.
        boolean bothConfirmed = Boolean.TRUE.equals(persistedMyTeam.getIsAnnuleMatch())
                && Boolean.TRUE.equals(opponentTeam.getIsAnnuleMatch());

        if (bothConfirmed) {
            // Quand les deux confirmations sont présentes, on exécute l'annulation métier complète dans la même transaction.
            cancelMatchAndResetTeams(match, teams);
            return null;
        }

        // Si une seule équipe a confirmé, on sauvegarde uniquement cet état intermédiaire.
        teamRepository.save(persistedMyTeam);

        // On recharge les équipes avec leurs membres pour retourner un état complet au frontend.
        Team refreshedMyTeam = teamRepository.findByIdWithMembers(persistedMyTeam.getId()).orElse(persistedMyTeam);
        Team refreshedOpponentTeam = teamRepository.findByIdWithMembers(opponentTeam.getId()).orElse(opponentTeam);

        return CurrentDualMatchDetailsDto.builder()
                .matchId(match.getId())
                .matchDate(match.getMatchDate())
                .startTime(match.getStartTime())
                .location(refreshedMyTeam.getTitleAddress())
                .myTeam(TeamDto.fromEntity(refreshedMyTeam))
                .opponentTeam(TeamDto.fromEntity(refreshedOpponentTeam))
                .build();
    }

    private void cancelMatchAndResetTeams(Match match, List<Team> teams) {
        // On prépare la liste des ids d'équipes pour appliquer les suppressions et sélections en masse.
        List<Long> teamIds = teams.stream()
                .map(Team::getId)
                .collect(Collectors.toList());

        // On charge tous les membres avant suppression pour pouvoir ensuite remettre leurs utilisateurs en INDISPONIBLE.
        List<TeamMember> teamMembers = teamMemberRepository.findByTeam_IdIn(teamIds);

        // Le match passe définitivement en état annulé.
        match.setStatus(MatchStatus.ANNULE);
        matchRepository.save(match);

        // On réinitialise complètement les deux équipes pour les sortir du match annulé.
        for (Team team : teams) {
            team.setStatus(TeamStatus.INACTIVE);
            team.setIsAnnuleMatch(false);
            team.setMatchesCanceled(1);
            team.setFormation(null);
            team.setTarificationTerrain(null);
            team.setTitleAddress(null);
            team.setPitchAddress(null);
            team.setPrix(null);
            team.setStartTime(null);
            team.setEndTime(null);
            team.setAvailableDate(null);
        }
        teamRepository.saveAll(teams);

        // On supprime explicitement tous les TeamMember déjà chargés pour garantir que les joueurs des deux équipes
        // sont bien supprimés, même si une suppression dérivée par team_id ne cible pas correctement tous les enregistrements.
        teamMemberRepository.deleteAllInBatch(teamMembers);

        // Tous les utilisateurs concernés sont remis en indisponible après l'annulation complète.
        List<User> impactedUsers = teamMembers.stream()
                .map(TeamMember::getUser)
                .filter(user -> user != null)
                .toList();

        impactedUsers.forEach(user -> user.setAvailabilityStatus(AvailabilityStatus.INDISPONIBLE));
        userRepository.saveAll(impactedUsers);
    }
}
