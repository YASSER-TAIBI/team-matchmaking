import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TeamInvitationDto } from '../../services/models/team-invitation-dto';
import { InvitationService } from '../../services/invitations/invitation.service';
import { TeamService } from '../../services/teams/team.service';
import { TeamDto } from '../../services/models/team-dto';
import { TeamMemberDto } from '../../services/models/team-member-dto';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

type TeamCreateTab = 'creation' | 'formation' | 'disponibilite' | 'invitation' | 'historique';

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './team-create.component.html',
  styleUrl: './team-create.component.scss'
})
export class TeamCreateComponent implements OnInit {
  private invitationService = inject(InvitationService);
  private teamService = inject(TeamService);

  activeTab: TeamCreateTab = 'creation';
  team: TeamDto | null = null;
  members: TeamMemberDto[] = [];
  invitations: TeamInvitationDto[] = [];
  invitationsLoading = false;
  invitationsError: string | null = null;

  isEditingIdentity = false;
  editName = '';
  editLogoUrl = '';
  showConfirmDialog = false;
  showLeaveTeamDialog = false;
  hasLeftTeam = false;
  teamActionPending = false;
  teamActionDialogMessage = "";
  teamActionDialogDetails: string[] = [];
  teamActionDialogIcon = '';

  ngOnInit(): void {
    this.teamService.findMyTeam().subscribe({
      next: (data) => {
        this.team = data;
        this.members = data?.members ?? [];
        this.hasLeftTeam = this.members.length === 0;
      },
      error: (err) => console.error('Erreur chargement équipe', err)
    });

    this.loadMemberInvitations();
  }

  loadMemberInvitations(): void {
    this.invitationsLoading = true;
    this.invitationsError = null;

    this.invitationService.findMemberInvitations().subscribe({
      next: (invitations) => {
        this.invitations = invitations;
        this.invitationsLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement invitations équipe', err);
        this.invitations = [];
        this.invitationsError = 'Impossible de charger les joueurs invités.';
        this.invitationsLoading = false;
      }
    });
  }

  get visibleInvitations(): TeamInvitationDto[] {
    return this.invitations.slice(0, 4);
  }

  get hasMoreThanFourInvitations(): boolean {
    return this.invitations.length > 4;
  }

  goToInvitations(): void {
    this.activeTab = 'invitation';
  }

  startEditIdentity(): void {
    this.editName = this.team?.name ?? '';
    this.editLogoUrl = this.team?.logoUrl ?? '';
    this.isEditingIdentity = true;
  }

  cancelEditIdentity(): void {
    this.isEditingIdentity = false;
  }

  saveIdentity(): void {
    this.showConfirmDialog = true;
  }

  onTeamActionClick(): void {
    if (this.hasLeftTeam) {
      this.teamActionDialogMessage = "Êtes-vous sûr de vouloir rejoindre votre équipe à nouveau ? \n Si vous confirmez, vous réintégrerez immédiatement votre équipe avec les effets suivants :";
      this.teamActionDialogDetails = [
        "Votre profil sera ajouté directement à la liste de sélection comme capitaine de l'équipe.",
        "Votre statut repassera à en équipe."
      ];
      this.teamActionDialogIcon = 'login';
      this.showLeaveTeamDialog = true;
      return;
    }

    this.teamActionDialogMessage = "Êtes-vous sûr de vouloir quitter l'équipe pour le moment ? \n Si vous confirmez, cette action aura les conséquences suivantes :";
    this.teamActionDialogDetails = [
      "Tous les membres de l'équipe seront retirés de la liste de sélection.",
      "Le statut de chaque membre passera à Indisponible.",
      "Toutes les invitations de cette équipe encore En Attente seront passées à Annulée."
    ];
    this.teamActionDialogIcon = 'logout';
    this.showLeaveTeamDialog = true;
  }

  confirmLeaveTeam(): void {
    if (this.teamActionPending) {
      return;
    }

    if (this.hasLeftTeam) {
      this.teamActionPending = true;
      this.teamService.rejoinMyTeam().subscribe({
        next: () => {
          this.teamService.findMyTeam().subscribe({
            next: (data) => {
              this.team = data;
              this.members = data?.members ?? [];
              this.hasLeftTeam = this.members.length === 0;
              this.showLeaveTeamDialog = false;
              this.loadMemberInvitations();
              this.teamActionPending = false;
            },
            error: (err: any) => {
              console.error("Erreur lors du rechargement de l'équipe", err);
              this.teamActionPending = false;
            }
          });
        },
        error: (err: any) => {
          console.error("Erreur lors de la réintégration de l'équipe", err);
          this.teamActionPending = false;
        }
      });
      return;
    }

    this.teamActionPending = true;
    this.teamService.leaveMyTeam().subscribe({
      next: () => {
        this.showLeaveTeamDialog = false;
        this.hasLeftTeam = true;
        this.team = null;
        this.members = [];
        this.loadMemberInvitations();
        this.teamActionPending = false;
      },
      error: (err: any) => {
        console.error("Erreur lors de la sortie de l'équipe", err);
        this.teamActionPending = false;
      }
    });
  }

  cancelLeaveTeam(): void {
    if (this.teamActionPending) {
      return;
    }

    this.showLeaveTeamDialog = false;
  }

  get teamActionLabel(): string {
    return this.hasLeftTeam ? "Rejoindre l'Équipe" : "Quitter l'Équipe";
  }

  get teamActionIcon(): string {
    return this.hasLeftTeam ? 'login' : 'logout';
  }

  confirmSave(): void {
    this.showConfirmDialog = false;
    if (!this.team) return;
    this.teamService.updateTeam({ name: this.editName, logoUrl: this.editLogoUrl }).subscribe({
      next: (updated: TeamDto) => {
        this.team = updated;
        this.isEditingIdentity = false;
      },
      error: (err: any) => console.error('Erreur lors de la mise à jour', err)
    });
  }

  cancelConfirm(): void {
    this.showConfirmDialog = false;
  }

  setTab(tab: TeamCreateTab, event?: Event): void {
    event?.preventDefault();
    this.activeTab = tab;
  }

  getMemberFullName(m: TeamMemberDto): string {
    const first = (m.firstName ?? '').charAt(0).toUpperCase() + (m.firstName ?? '').slice(1).toLowerCase();
    const last = (m.lastName ?? '').charAt(0).toUpperCase() + (m.lastName ?? '').slice(1).toLowerCase();
    return `${first} ${last}`.trim() || 'Joueur';
  }

  getMemberInitials(m: TeamMemberDto): string {
    const first = m.firstName?.[0] ?? '';
    const last = m.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  levelLabel(level?: string): string {
    switch (level) {
      case 'DEBUTANT':
        return 'Débutant';
      case 'INTERMEDIAIRE':
        return 'Intermédiaire';
      case 'CONFIRMER':
        return 'Confirmé';
      case 'AVANCE':
        return 'Avancé';
      default:
        return '-';
    }
  }

  levelBadgeClass(level?: string): string {
    switch (level) {
      case 'DEBUTANT':
        return 'badge--green';
      case 'INTERMEDIAIRE':
        return 'badge--blue';
      case 'CONFIRMER':
        return 'badge--yellow';
      case 'AVANCE':
        return 'badge--red';
      default:
        return 'badge--green';
    }
  }

  capitalize(value?: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
  
  getInvitationFullName(invitation: TeamInvitationDto): string {
    const first = this.capitalize(invitation.invitedUserFirstName);
    const last = this.capitalize(invitation.invitedUserLastName);
    return `${first} ${last}`.trim() || 'Joueur';
  }

  getInvitationInitials(invitation: TeamInvitationDto): string {
    const first = invitation.invitedUserFirstName?.[0] ?? '';
    const last = invitation.invitedUserLastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || 'J';
  }

  invitationStatusLabel(status?: TeamInvitationDto['status']): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'En Attente';
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

  invitationStatusClass(status?: TeamInvitationDto['status']): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'recruit-item__action recruit-item__action--pending';
      case 'ACCEPTEE':
        return 'recruit-item__action recruit-item__action--accepted';
      case 'REFUSEE':
        return 'recruit-item__action recruit-item__action--rejected';
      case 'ANNULLEE':
        return 'recruit-item__action recruit-item__action--cancelled';
      default:
        return 'recruit-item__action recruit-item__action--pending';
    }
  }
}
