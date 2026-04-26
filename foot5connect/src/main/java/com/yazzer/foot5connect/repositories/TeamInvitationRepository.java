package com.yazzer.foot5connect.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yazzer.foot5connect.models.InvitationStatus;
import com.yazzer.foot5connect.models.InvitationType;
import com.yazzer.foot5connect.models.TeamInvitation;

public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {

    List<TeamInvitation> findByInvitedUser_IdOrderByCreatedDateDesc(Long userId);

    Optional<TeamInvitation> findByIdAndInvitedUser_Id(Long invitationId, Long invitedUserId);

    List<TeamInvitation> findByInvitedUser_IdAndIdNot(Long invitedUserId, Long invitationId);

    List<TeamInvitation> findByInvitedUser_IdAndStatus(Long invitedUserId, InvitationStatus status);

    boolean existsBySenderTeam_IdAndInvitedUser_IdAndStatusAndType(Long senderTeamId, Long invitedUserId, InvitationStatus status, InvitationType type);

    boolean existsBySenderTeam_IdAndReceiverTeam_IdAndStatusAndType(Long senderTeamId, Long receiverTeamId, InvitationStatus status, InvitationType type);

    List<TeamInvitation> findBySenderTeam_IdAndStatus(Long teamId, InvitationStatus status);
 
    List<TeamInvitation> findByReceiverTeam_IdOrderByLastModifiedDateDesc(Long teamId);
}
