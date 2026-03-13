package com.yazzer.foot5connect.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yazzer.foot5connect.models.InvitationStatus;
import com.yazzer.foot5connect.models.TeamInvitation;

public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {

    List<TeamInvitation> findByInvitedUser_IdOrderByCreatedDateDesc(Long userId);

    Optional<TeamInvitation> findByIdAndInvitedUser_Id(Long invitationId, Long invitedUserId);

    List<TeamInvitation> findByInvitedUser_IdAndIdNot(Long invitedUserId, Long invitationId);

    boolean existsByTeam_IdAndInvitedUser_IdAndStatus(Long teamId, Long invitedUserId, InvitationStatus status);

    List<TeamInvitation> findByTeam_IdOrderByLastModifiedDateDesc(Long teamId);

    List<TeamInvitation> findByTeam_IdAndStatus(Long teamId, InvitationStatus status);
}
