import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { AvailablePlayerDto } from '../../services/models/available-player-dto';
import { CreateTeamInvitationRequest } from '../../services/models/create-team-invitation-request';
import { UserDto } from '../../services/models/user-dto';
import { HelperService } from '../../services/helper/helper.service';
import { InvitationService } from '../../services/invitations/invitation.service';
import { TeamService } from '../../services/teams/team.service';
import { UserService } from '../../services/users/user.service';

@Component({
  selector: 'app-available-players',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatInputModule],
  templateUrl: './available-players.component.html',
  styleUrl: './available-players.component.scss'
})
export class AvailablePlayersComponent implements OnInit {

  private readonly playersBatchSize = 8;

  private helperService = inject(HelperService);
  private userService = inject(UserService);
  private invitationService = inject(InvitationService);
  private teamService = inject(TeamService);

  allPlayers: AvailablePlayerDto[] = [];
  players: AvailablePlayerDto[] = [];
  loading = false;
  error: string | null = null;
  currentUserHasTeam = false;
  currentUserIsInTeamSelection = false;

  selectedLevel: AvailablePlayerDto['level'] | null = null;
  selectedDate: Date | null = null;

  userCountry: string | null = null;
  userCity: string | null = null;
  currentUserId: number | null = null;
  visiblePlayersCount = this.playersBatchSize;

  inviteModalVisible = false;
  inviteSubmitting = false;
  inviteError: string | null = null;
  inviteSuccess: string | null = null;
  invitedPlayer: AvailablePlayerDto | null = null;
  proposedDate = '';
  proposedStartTime = '';
  proposedEndTime = '';

  ngOnInit(): void {
    this.currentUserId = this.helperService.userId;
    this.loadUserLocation();
    this.loadCurrentUserTeam();
    this.loadPlayers();
  }

  private loadCurrentUserTeam(): void {
    this.teamService.findMyTeam().subscribe({
      next: (team) => {
        this.currentUserHasTeam = !!team;
        this.currentUserIsInTeamSelection = !!team?.members?.some(member => member.userId === this.currentUserId);
      },
      error: () => {
        this.currentUserHasTeam = false;
        this.currentUserIsInTeamSelection = false;
      }
    });
  }

  private loadUserLocation(): void {
    const userId = this.helperService.userId;
    if (!userId) {
      this.userCountry = null;
      this.userCity = null;
      return;
    }

    this.userService.findById(userId).subscribe({
      next: (user: UserDto | null) => {
        this.userCountry = user?.country ?? null;
        this.userCity = user?.city ?? null;
      },
      error: () => {
        this.userCountry = null;
        this.userCity = null;
      }
    });
  }

  loadPlayers(): void {
    this.loading = true;
    this.error = null;

    this.userService.findAvailablePlayersInMyLocation().subscribe({
      next: (players: AvailablePlayerDto[]) => {
        this.allPlayers = players ?? [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.error = 'Impossible de charger les joueurs disponibles dans votre localisation.';
        this.allPlayers = [];
        this.players = [];
        this.loading = false;
      }
    });
  }

  onLevelChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value ?? '';
    this.selectedLevel = (value ? (value as AvailablePlayerDto['level']) : null);
  }

  onDateSelected(date: Date | null): void {
    this.selectedDate = date;
  }

  onAvailabilityInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    if (!value) {
      this.selectedDate = null;
    }
  }

  applyFilters(): void {
    const level = this.selectedLevel;
    const selectedDate = this.selectedDate;
    const selectedDateOnly = selectedDate
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      : null;

    this.players = this.allPlayers.filter(p => {
      if (level && p.level !== level) {
        return false;
      }

      if (selectedDateOnly) {
        const dateOnly = (p.availableDate ?? '').slice(0, 10);
        if (dateOnly !== selectedDateOnly) {
          return false;
        }
      }

      return true;
    });

    this.visiblePlayersCount = this.playersBatchSize;
  }

  get visiblePlayers(): AvailablePlayerDto[] {
    return this.players.slice(0, this.visiblePlayersCount);
  }

  get canLoadMorePlayers(): boolean {
    return this.visiblePlayersCount < this.players.length;
  }

  loadMorePlayers(): void {
    this.visiblePlayersCount += this.playersBatchSize;
  }

  isCurrentUser(player: AvailablePlayerDto): boolean {
    const me = this.currentUserId;
    const other = player.userId ?? null;
    return me != null && other != null && me === other;
  }

  canMessage(player: AvailablePlayerDto): boolean {
    return !this.isCurrentUser(player) && this.currentUserHasTeam && this.currentUserIsInTeamSelection;
  }

  canInvite(player: AvailablePlayerDto): boolean {
    return !this.isCurrentUser(player) && this.currentUserHasTeam && this.currentUserIsInTeamSelection;
  }

  onMessageClick(): void {
    console.log('message ecrit');
  }

  onInviteClick(player: AvailablePlayerDto): void {
    if (!this.canInvite(player) || !player.userId) {
      return;
    }

    this.inviteError = null;
    this.invitedPlayer = player;
    this.proposedDate = (player.availableDate ?? '').slice(0, 10);
    this.proposedStartTime = this.formatInputTime(player.startTime);
    this.proposedEndTime = this.formatInputTime(player.endTime);
    this.inviteModalVisible = true;
  }

  closeInviteModal(): void {
    if (this.inviteSubmitting) {
      return;
    }
    this.inviteModalVisible = false;
    this.invitedPlayer = null;
    this.inviteError = null;
  }

  submitInvitation(): void {
    if (!this.invitedPlayer?.userId) {
      this.inviteError = 'Joueur invalide.';
      return;
    }

    if (!this.proposedDate || !this.proposedStartTime || !this.proposedEndTime) {
      this.inviteError = 'Veuillez compléter la date et les horaires proposés.';
      return;
    }

    this.inviteSubmitting = true;
    this.inviteError = null;

    const payload: CreateTeamInvitationRequest = {
      invitedUserId: this.invitedPlayer.userId,
      availableDate: this.proposedDate,
      startTime: `${this.proposedStartTime}:00`,
      endTime: `${this.proposedEndTime}:00`
    };

    this.invitationService.createInvitation(payload).subscribe({
      next: () => {
        this.inviteSubmitting = false;
        this.inviteSuccess = `Invitation envoyée à ${(this.invitedPlayer?.firstName ?? '')} ${(this.invitedPlayer?.lastName ?? '')}`.trim();
        this.closeInviteModal();
      },
      error: (err: any) => {
        this.inviteSubmitting = false;
        this.inviteError = err?.error?.message ?? "Impossible d'envoyer l'invitation.";
      }
    });
  }

  private formatInputTime(time?: string): string {
    if (!time) {
      return '';
    }
    return time.length >= 5 ? time.slice(0, 5) : time;
  }

  initials(player: AvailablePlayerDto): string {
    const first = (player.firstName ?? '').trim();
    const last = (player.lastName ?? '').trim();
    const value = `${first} ${last}`.trim();
    const parts = value.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? '';
    return (a + b).toUpperCase();
  }

  levelLabel(level?: AvailablePlayerDto['level']): string {
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

  levelBadgeClass(level?: AvailablePlayerDto['level']): string {
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

  formatDate(date?: string): string {
    if (!date) {
      return '-';
    }
    try {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
    } catch {
      return date;
    }
  }

  formatTime(time?: string): string {
    if (!time) {
      return '--:--';
    }
    return time.length >= 5 ? time.slice(0, 5) : time;
  }
}
