import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { TeamInvitationDto } from '../../services/models/team-invitation-dto';
import { HelperService } from '../../services/helper/helper.service';
import { InvitationService } from '../../services/invitations/invitation.service';
import { TeamService } from '../../services/teams/team.service';
import { TeamDto } from '../../services/models/team-dto';
import { TeamMemberDto } from '../../services/models/team-member-dto';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

type TeamCreateTab = 'creation' | 'formation' | 'disponibilite' | 'invitation' | 'historique';
type TeamEditSection = 'identity' | 'formation';
type PlayerPositionOption = NonNullable<TeamMemberDto['position']>;
type PlayerSelectionOption = NonNullable<TeamMemberDto['selection']>;

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, ConfirmDialogComponent],
  templateUrl: './team-create.component.html',
  styleUrl: './team-create.component.scss'
})
export class TeamCreateComponent implements OnInit {
  private helperService = inject(HelperService);
  private invitationService = inject(InvitationService);
  private teamService = inject(TeamService);

  activeTab: TeamCreateTab = 'creation';
  team: TeamDto | null = null;
  members: TeamMemberDto[] = [];
  currentUserId: number | null = null;
  invitations: TeamInvitationDto[] = [];
  filteredInvitations: TeamInvitationDto[] = [];
  invitationsLoading = false;
  invitationsError: string | null = null;
  selectedInvitationLevel: TeamInvitationDto['invitedUserLevel'] | null = null;
  selectedInvitationStatus: TeamInvitationDto['status'] | null = null;
  selectedInvitationDate: Date | null = null;

  isEditingIdentity = false;
  isEditingFormation = false;
  editName = '';
  editLogoUrl = '';
  editMembers: TeamMemberDto[] = [];
  showConfirmDialog = false;
  showFormationValidationDialog = false;
  confirmEditSection: TeamEditSection = 'identity';
  showLeaveTeamDialog = false;
  showRemoveMemberDialog = false;
  hasLeftTeam = false;
  teamActionPending = false;
  teamActionDialogMessage = "";
  teamActionDialogDetails: string[] = [];
  teamActionDialogIcon = '';
  memberActionPending = false;
  memberToRemove: TeamMemberDto | null = null;
  formationValidationMessage = '';
  formationValidationDetails: string[] = [];

  readonly positionOptions: Array<{ value: PlayerPositionOption; label: string }> = [
    { value: 'GOALKEEPER', label: 'Gardien' },
    { value: 'DEFENDER', label: 'Défenseur' },
    { value: 'MIDFIELDER', label: 'Milieu' },
    { value: 'ATTACKER', label: 'Attaquant' }
  ];

  readonly selectionOptions: Array<{ value: PlayerSelectionOption; label: string }> = [
    { value: 'STARTER', label: 'Titulaire' },
    { value: 'SUBSTITUTE', label: 'Remplaçant' }
  ];

  ngOnInit(): void {
    this.currentUserId = this.helperService.userId;

    this.teamService.findMyTeam().subscribe({
      next: (data) => {
        this.team = data;
        this.members = data?.members ?? [];
        this.syncFormationEditMembers();
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
        this.applyInvitationFilters();
        this.invitationsLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement invitations équipe', err);
        this.invitations = [];
        this.filteredInvitations = [];
        this.invitationsError = 'Impossible de charger les joueurs invités.';
        this.invitationsLoading = false;
      }
    });
  }

  get visibleInvitations(): TeamInvitationDto[] {
    return this.filteredInvitations.slice(0, 4);
  }

  get hasMoreThanFourInvitations(): boolean {
    return this.filteredInvitations.length > 4;
  }

  onInvitationLevelChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value ?? '';
    this.selectedInvitationLevel = value ? (value as TeamInvitationDto['invitedUserLevel']) : null;
  }

  onInvitationStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value ?? '';
    this.selectedInvitationStatus = value ? (value as TeamInvitationDto['status']) : null;
  }

  onInvitationDateSelected(date: Date | null): void {
    this.selectedInvitationDate = date;
  }

  onInvitationDateInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    if (!value) {
      this.selectedInvitationDate = null;
    }
  }

  applyInvitationFilters(): void {
    const selectedDate = this.selectedInvitationDate;
    const selectedDateOnly = selectedDate
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      : null;

    this.filteredInvitations = this.invitations.filter(invitation => {
      if (this.selectedInvitationLevel && invitation.invitedUserLevel !== this.selectedInvitationLevel) {
        return false;
      }

      if (this.selectedInvitationStatus && invitation.status !== this.selectedInvitationStatus) {
        return false;
      }

      if (selectedDateOnly) {
        const invitationDateOnly = (invitation.availableDate ?? '').slice(0, 10);
        if (invitationDateOnly !== selectedDateOnly) {
          return false;
        }
      }

      return true;
    });
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
    this.confirmEditSection = 'identity';
    this.showConfirmDialog = true;
  }

  startEditFormation(): void {
    this.syncFormationEditMembers();
    this.isEditingFormation = true;
  }

  cancelEditFormation(): void {
    this.syncFormationEditMembers();
    this.isEditingFormation = false;
  }

  saveFormation(): void {
    const validationErrors = this.validateFormation();

    if (validationErrors.length > 0) {
      this.formationValidationMessage = 'La composition de votre équipe n’est pas valide. Corrigez les éléments suivants avant de confirmer :';
      this.formationValidationDetails = validationErrors;
      this.showFormationValidationDialog = true;
      return;
    }

    this.confirmEditSection = 'formation';
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
          this.teamService.findMyMemberTeam().subscribe({
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

    if (this.confirmEditSection === 'formation') {
      const formationMembersPayload: TeamMemberDto[] = this.editMembers.map(member => ({
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        jerseyNumber: member.jerseyNumber,
        position: member.position,
        selection: member.selection
      }));

      this.teamService.updateTeam({ members: formationMembersPayload }).subscribe({
        next: (updated: TeamDto) => {
          this.team = updated;
          this.members = updated?.members ?? [];
          this.syncFormationEditMembers();
          this.isEditingFormation = false;
        },
        error: (err: any) => console.error('Erreur lors de la mise à jour de la formation', err)
      });
      return;
    }

    this.teamService.updateTeam({ name: this.editName, logoUrl: this.editLogoUrl }).subscribe({
      next: (updated: TeamDto) => {
        this.team = updated;
        this.members = updated?.members ?? this.members;
        this.syncFormationEditMembers();
        this.isEditingIdentity = false;
      },
      error: (err: any) => console.error('Erreur lors de la mise à jour', err)
    });
  }

  cancelConfirm(): void {
    this.showConfirmDialog = false;
  }

  closeFormationValidationDialog(): void {
    this.showFormationValidationDialog = false;
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

  get formationMembers(): TeamMemberDto[] {
    return this.isEditingFormation ? this.editMembers : this.members;
  }

  get formationTitle(): string {
    const members = this.formationMembers;
    const goalkeepers = members.filter(member => member.position === 'GOALKEEPER').length;
    const defenders = members.filter(member => member.position === 'DEFENDER').length;
    const midfielders = members.filter(member => member.position === 'MIDFIELDER').length;
    const attackers = members.filter(member => member.position === 'ATTACKER').length;

    return `${goalkeepers}-${defenders}-${midfielders}-${attackers}`;
  }

  get starterMembersCount(): number {
    return this.formationMembers.filter(member => member.selection === 'STARTER').length;
  }

  getFormationMemberById(memberId?: number): TeamMemberDto | undefined {
    return this.editMembers.find(member => member.id === memberId);
  }

  positionLabel(position?: TeamMemberDto['position']): string {
    switch (position) {
      case 'GOALKEEPER':
        return 'Gardien';
      case 'DEFENDER':
        return 'Défenseur';
      case 'MIDFIELDER':
        return 'Milieu';
      case 'ATTACKER':
        return 'Attaquant';
      case 'SUBSTITUTE':
        return 'Remplaçant';
      default:
        return 'Non défini';
    }
  }

  selectionLabel(selection?: TeamMemberDto['selection']): string {
    switch (selection) {
      case 'STARTER':
        return 'Titulaire';
      case 'SUBSTITUTE':
        return 'Remplaçant';
      default:
        return 'Non défini';
    }
  }

  positionDotClass(position?: TeamMemberDto['position']): string {
    switch (position) {
      case 'GOALKEEPER':
        return 'pos-pill__dot pos-pill__dot--green';
      case 'DEFENDER':
        return 'pos-pill__dot pos-pill__dot--red';
      case 'MIDFIELDER':
        return 'pos-pill__dot pos-pill__dot--yellow';
      case 'ATTACKER':
        return 'pos-pill__dot pos-pill__dot--blue';
      default:
        return 'pos-pill__dot pos-pill__dot--gray';
    }
  }

  trackMember(index: number, member: TeamMemberDto): number | string {
    return member.userId ?? member.id ?? index;
  }

  private validateFormation(): string[] {
    const errors: string[] = [];
    const members = this.editMembers;

    const countByPosition = {
      GOALKEEPER: members.filter(member => member.position === 'GOALKEEPER').length,
      DEFENDER: members.filter(member => member.position === 'DEFENDER').length,
      MIDFIELDER: members.filter(member => member.position === 'MIDFIELDER').length,
      ATTACKER: members.filter(member => member.position === 'ATTACKER').length
    };

    if (countByPosition.GOALKEEPER > 1) {
      errors.push('Vous ne pouvez pas avoir plus d’un gardien.');
    }

    const starters = members.filter(member => member.selection === 'STARTER');
    const substitutesCount = members.filter(member => member.selection === 'SUBSTITUTE').length;

    const starterGoalkeepers = starters.filter(member => member.position === 'GOALKEEPER').length;
    const starterDefenders = starters.filter(member => member.position === 'DEFENDER').length;
    const starterMidfielders = starters.filter(member => member.position === 'MIDFIELDER').length;
    const starterAttackers = starters.filter(member => member.position === 'ATTACKER').length;

    const hasCompleteStarterLineup = starters.length === 5;

    if (hasCompleteStarterLineup && starterGoalkeepers < 1) {
      errors.push('Votre sélection titulaire doit contenir au minimum 1 gardien.');
    }

    if (hasCompleteStarterLineup && starterDefenders < 1) {
      errors.push('Votre sélection titulaire doit contenir au minimum 1 défenseur.');
    }

    if (hasCompleteStarterLineup && starterMidfielders < 1) {
      errors.push('Votre sélection titulaire doit contenir au minimum 1 milieu.');
    }

    if (hasCompleteStarterLineup && starterAttackers < 1) {
      errors.push('Votre sélection titulaire doit contenir au minimum 1 attaquant.');
    }

    if (starterDefenders > 2) {
      errors.push('Votre sélection titulaire ne peut pas contenir plus de 2 défenseurs.');
    }

    if (starterMidfielders > 2) {
      errors.push('Votre sélection titulaire ne peut pas contenir plus de 2 milieux.');
    }

    if (starterAttackers > 2) {
      errors.push('Votre sélection titulaire ne peut pas contenir plus de 2 attaquants.');
    }

    const doubledStarterLines = [starterDefenders, starterMidfielders, starterAttackers]
      .filter(count => count === 2).length;

    if (doubledStarterLines > 1) {
      errors.push('Votre formation doit respecter un seul schéma parmi 1-2-1-1, 1-1-2-1 ou 1-1-1-2. Un seul poste peut être en double entre défenseur, milieu et attaquant.');
    }

    if (hasCompleteStarterLineup && doubledStarterLines !== 1) {
      errors.push('Avec 5 titulaires, votre formation doit être 1-2-1-1, 1-1-2-1 ou 1-1-1-2.');
    }

    if (substitutesCount > 0 && starters.length < 5) {
      errors.push('Vous devez avoir 5 titulaires avant de pouvoir ajouter un remplaçant.');
    }

    return errors;
  }

  private syncFormationEditMembers(): void {
    this.editMembers = this.members.map(member => ({ ...member }));
  }

  isCurrentMember(member: TeamMemberDto): boolean {
    const me = this.currentUserId;
    const other = member.userId ?? null;
    return me != null && other != null && me === other;
  }

  openRemoveMemberDialog(member: TeamMemberDto): void {
    if (!member.userId || this.isCurrentMember(member)) {
      return;
    }

    this.memberToRemove = member;
    this.showRemoveMemberDialog = true;
  }

  confirmRemoveMember(): void {
    if (this.memberActionPending || !this.memberToRemove?.userId) {
      return;
    }

    this.memberActionPending = true;
    this.teamService.removeMemberFromMyTeam(this.memberToRemove.userId).subscribe({
      next: () => {
        this.teamService.findMyTeam().subscribe({
          next: (data) => {
            this.team = data;
            this.members = data?.members ?? [];
            this.syncFormationEditMembers();
            this.hasLeftTeam = this.members.length === 0;
            this.memberToRemove = null;
            this.showRemoveMemberDialog = false;
            this.memberActionPending = false;
          },
          error: (err: any) => {
            console.error("Erreur lors du rechargement de l'équipe", err);
            this.memberActionPending = false;
          }
        });
      },
      error: (err: any) => {
        console.error("Erreur lors de la sortie du joueur de l'équipe", err);
        this.memberActionPending = false;
      }
    });
  }

  cancelRemoveMember(): void {
    if (this.memberActionPending) {
      return;
    }

    this.memberToRemove = null;
    this.showRemoveMemberDialog = false;
  }

  get removeMemberDialogMessage(): string {
    if (!this.memberToRemove) {
      return '';
    }

    return `Voulez-vous vraiment sortir ${this.getMemberFullName(this.memberToRemove)} de l'équipe ?`;
  }

  get removeMemberDialogDetails(): string[] {
    return [
      "Le joueur sera retiré de la liste de sélection.",
      "Son statut passera immédiatement à Indisponible."
    ];
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

  formatInvitationDate(date?: string): string {
    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatInvitationTime(time?: string): string {
    if (!time) {
      return '-';
    }

    return time.slice(0, 5);
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
