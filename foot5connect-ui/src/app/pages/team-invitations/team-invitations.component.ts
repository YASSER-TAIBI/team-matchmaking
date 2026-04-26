import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { InvitationService } from '../../services/invitations/invitation.service';
import { TeamInvitationDto } from '../../services/models/team-invitation-dto';

@Component({
  selector: 'app-team-invitations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-invitations.component.html',
  styleUrl: './team-invitations.component.scss'
})
export class TeamInvitationsComponent implements OnInit {
  private invitationService = inject(InvitationService);

  activeTeamTab: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULLEE' = 'EN_ATTENTE';
  activeMatchTab: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULLEE' = 'EN_ATTENTE';
  invitations: TeamInvitationDto[] = [];
  loading = false;
  error: string | null = null;
  actionLoadingId: number | null = null;

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.loading = true;
    this.error = null;

    this.invitationService.findMyInvitations().subscribe({
      next: (data) => {
        this.invitations = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger vos invitations.';
        this.invitations = [];
        this.loading = false;
      }
    });
  }

  setTeamTab(tab: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULLEE', event: Event): void {
    event.preventDefault();
    this.activeTeamTab = tab;
  }

  setMatchTab(tab: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULLEE', event: Event): void {
    event.preventDefault();
    this.activeMatchTab = tab;
  }

  get teamInvitations(): TeamInvitationDto[] {
    return this.invitations.filter(invitation => invitation.type === 'PLAYER');
  }

  get matchInvitations(): TeamInvitationDto[] {
    return this.invitations.filter(invitation => invitation.type === 'MATCH');
  }

  get filteredTeamInvitations(): TeamInvitationDto[] {
    return this.teamInvitations.filter(invitation => invitation.status === this.activeTeamTab);
  }

  get filteredMatchInvitations(): TeamInvitationDto[] {
    return this.matchInvitations.filter(invitation => invitation.status === this.activeMatchTab);
  }

  acceptInvitation(invitation: TeamInvitationDto): void {
    const id = invitation.id;
    if (!id) {
      return;
    }

    this.actionLoadingId = id;
    this.invitationService.acceptInvitation(id).subscribe({
      next: () => {
        this.reloadInvitationsAfterAction();
      },
      error: () => {
        this.error = "Impossible d'accepter l'invitation.";
        this.actionLoadingId = null;
      }
    });
  }

  rejectInvitation(invitation: TeamInvitationDto): void {
    const id = invitation.id;
    if (!id) {
      return;
    }

    this.actionLoadingId = id;
    this.invitationService.rejectInvitation(id).subscribe({
      next: () => {
        this.reloadInvitationsAfterAction();
      },
      error: () => {
        this.error = "Impossible de refuser l'invitation.";
        this.actionLoadingId = null;
      }
    });
  }

  canRespond(invitation: TeamInvitationDto): boolean {
    return invitation.status === 'EN_ATTENTE';
  }

  invitationLabel(status?: TeamInvitationDto['status']): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'ACCEPTEE':
        return 'Acceptée';
      case 'REFUSEE':
        return 'Refusée';
      case 'ANNULLEE':
        return 'Annulée';
      default:
        return '-';
    }
  }

  tabLabel(status: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULLEE'): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'ACCEPTEE':
        return 'Acceptée';
      case 'REFUSEE':
        return 'Refusée';
      case 'ANNULLEE':
        return 'Annulée';
    }
  }

  countByStatus(status: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'ANNULLEE', type: 'PLAYER' | 'MATCH'): number {
    return this.invitations.filter(invitation => invitation.type === type && invitation.status === status).length;
  }

  invitationBadgeClass(status?: TeamInvitationDto['status']): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'badge badge--pending';
      case 'ACCEPTEE':
        return 'badge badge--accepted';
      case 'REFUSEE':
        return 'badge badge--rejected';
      case 'ANNULLEE':
        return 'badge badge--cancelled';
      default:
        return 'badge';
    }
  }

  formatDate(date?: string): string {
    if (!date) {
      return '-';
    }

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  formatTime(time?: string): string {
    if (!time) {
      return '--:--';
    }
    return time.length >= 5 ? time.slice(0, 5) : time;
  }

  fullName(invitation: TeamInvitationDto): string {
    return `${invitation.invitedUserFirstName ?? ''} ${invitation.invitedUserLastName ?? ''}`.trim() || 'Joueur';
  }

  private reloadInvitationsAfterAction(): void {
    this.error = null;
    this.invitationService.findMyInvitations().subscribe({
      next: (data) => {
        this.invitations = data ?? [];
        this.actionLoadingId = null;
      },
      error: () => {
        this.error = 'Impossible de rafraîchir les invitations.';
        this.actionLoadingId = null;
      }
    });
  }
}
