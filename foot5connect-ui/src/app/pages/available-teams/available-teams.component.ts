import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MATCHES_IMAGES } from '../../../assets/img/matches/matches-images';
import { InvitationService } from '../../services/invitations/invitation.service';
import { CreateTeamInvitationRequest } from '../../services/models/create-team-invitation-request';
import { TeamDto } from '../../services/models/team-dto';
import { TeamService } from '../../services/teams/team.service';
import { UserDto } from '../../services/models/user-dto';
import { UserService } from '../../services/users/user.service';

interface MatchRequestCard {
  id: number;
  captainId: number | null;
  teamName: string;
  logoUrl: string | null;
  ratingLabel: string;
  availableDateOnly: string | null;
  levelCode: TeamDto['teamLevel'] | null;
  dateLabel: string;
  relativeDateLabel: string;
  venueName: string;
  venueMeta: string;
  level: string;
  format: string;
  price: string;
  city: string;
  country: string;
  competitive: boolean;
  heroClass: string;
  backgroundImage: string;
  logoClass: string;
  initials: string;
}

@Component({
  selector: 'app-available-teams',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatInputModule],
  templateUrl: './available-teams.component.html',
  styleUrls: ['./available-teams.component.scss']
})
export class AvailableTeamsComponent implements OnInit {
  private readonly teamService = inject(TeamService);
  private readonly invitationService = inject(InvitationService);
  private readonly userService = inject(UserService);

  cards: MatchRequestCard[] = [];
  hasCompleteTeam = false;
  permissionsLoaded = false;
  currentUserTeamId: number | null = null;
  currentTeam: TeamDto | null = null;
  visibleCount = 6;
  isLoading = false;
  errorMessage = '';
  inviteModalVisible = false;
  inviteSubmitting = false;
  inviteError: string | null = null;
  inviteSuccess: string | null = null;
  invitedTeam: MatchRequestCard | null = null;
  proposedDate = '';
  proposedStartTime = '';
  proposedEndTime = '';

  selectedDate: Date | null = null;
  selectedLevel: TeamDto['teamLevel'] | '' = '';
  appliedDate: Date | null = null;
  appliedLevel: TeamDto['teamLevel'] | '' = '';

  userCity: string | null = null;
  userCountry: string | null = null;
  currentUserId: number | null = null;
  readonly levelOptions: Array<{ value: TeamDto['teamLevel']; label: string }> = [
    { value: 'DEBUTANT', label: 'Débutant' },
    { value: 'AMATEUR', label: 'Amateur' },
    { value: 'AVANCE', label: 'Avancé' }
  ];
  readonly heroClasses = [
    'matches-card__media--night',
    'matches-card__media--field',
    'matches-card__media--strategy',
    'matches-card__media--ball',
    'matches-card__media--action',
    'matches-card__media--stadium'
  ];
  readonly logoClasses = [
    'matches-card__logo-inner--emerald',
    'matches-card__logo-inner--violet',
    'matches-card__logo-inner--orange',
    'matches-card__logo-inner--teal',
    'matches-card__logo-inner--purple',
    'matches-card__logo-inner--green'
  ];
  readonly backgroundImages = Object.values(MATCHES_IMAGES);

  ngOnInit(): void {
    this.loadCurrentUserContext();
  }

  private loadCurrentUserContext(): void {
    this.userService.findMe().subscribe({
      next: (user: UserDto | null) => {
        this.currentUserId = user?.id ?? null;
        this.userCity = user?.city ?? null;
        this.userCountry = user?.country ?? null;
        this.loadActionPermissions();
        this.loadCompleteTeams();
      },
      error: () => {
        this.currentUserId = null;
        this.userCity = null;
        this.userCountry = null;
        this.loadActionPermissions();
        this.loadCompleteTeams();
      }
    });
  }

  get filteredCards(): MatchRequestCard[] {
    const selectedDateOnly = this.appliedDate
      ? `${this.appliedDate.getFullYear()}-${String(this.appliedDate.getMonth() + 1).padStart(2, '0')}-${String(this.appliedDate.getDate()).padStart(2, '0')}`
      : null;

    return this.cards.filter((card) => {
      const cityMatch = !this.userCity || card.city === this.userCity;
      const countryMatch = !this.userCountry || card.country === this.userCountry;
      const dateMatch = !selectedDateOnly || card.availableDateOnly === selectedDateOnly;
      const levelMatch = !this.appliedLevel || card.levelCode === this.appliedLevel;
      return cityMatch && countryMatch && dateMatch && levelMatch;
    });
  }

  get visibleCards(): MatchRequestCard[] {
    return this.filteredCards.slice(0, this.visibleCount);
  }

  get canLoadMore(): boolean {
    return this.visibleCount < this.filteredCards.length;
  }

  get canUseMatchActions(): boolean {
    return this.permissionsLoaded && this.hasCompleteTeam;
  }

  canUseMatchActionsForCard(card: MatchRequestCard): boolean {
    return this.canUseMatchActions && card.id !== this.currentUserTeamId;
  }

  searchMatches(): void {
    this.appliedDate = this.selectedDate;
    this.appliedLevel = this.selectedLevel;
    this.visibleCount = 6;
  }

  resetFilters(): void {
    this.selectedDate = null;
    this.selectedLevel = '';
    this.appliedDate = null;
    this.appliedLevel = '';
    this.visibleCount = 6;
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

  loadMore(): void {
    this.visibleCount += 3;
  }

  trackByCardId(_index: number, card: MatchRequestCard): number {
    return card.id;
  }

  onSendChallenge(card: MatchRequestCard): void {
    if (!this.canUseMatchActionsForCard(card) || !card.captainId) {
      return;
    }

    this.inviteError = null;
    this.invitedTeam = card;
    this.proposedDate = (this.currentTeam?.availableDate ?? '').slice(0, 10);
    this.proposedStartTime = this.formatInputTime(this.currentTeam?.startTime);
    this.proposedEndTime = this.formatInputTime(this.currentTeam?.endTime);
    this.inviteModalVisible = true;
  }

  onMessageTeam(card: MatchRequestCard): void {
    console.log('[available-teams] message click', {
      cardId: card.id,
      teamName: card.teamName,
      hasCompleteTeam: this.hasCompleteTeam,
      canUseMatchActions: this.canUseMatchActions,
      currentUserTeamId: this.currentUserTeamId
    });
  }

  private loadCompleteTeams(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.teamService.findCompleteTeamsInMyCity().subscribe({
      next: (teams: TeamDto[]) => {
        this.cards = teams.map((team, index) => this.mapTeamToCard(team, index));
        this.visibleCount = 6;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les équipes disponibles pour ta ville.';
        this.cards = [];
        this.isLoading = false;
      }
    });
  }

  private loadActionPermissions(): void {
    this.hasCompleteTeam = false;
    this.permissionsLoaded = false;
    this.currentUserTeamId = null;
    this.currentTeam = null;

    this.teamService.findMyTeam().subscribe({
      next: (team: TeamDto | null) => {
        this.currentTeam = team;
        this.currentUserTeamId = team?.id ?? null;
        if (this.isCompleteTeam(team)) {
          this.hasCompleteTeam = true;
          this.permissionsLoaded = true;
          return;
        }
        this.loadMemberTeamPermission();
      },
      error: () => {
        this.loadMemberTeamPermission();
      }
    });
  }

  private loadMemberTeamPermission(): void {
    this.teamService.findMyMemberTeam().subscribe({
      next: (team: TeamDto | null) => {
        this.currentTeam = team;
        this.currentUserTeamId = team?.id ?? null;
        this.hasCompleteTeam = this.isCompleteTeam(team);
        this.permissionsLoaded = true;
      },
      error: () => {
        this.hasCompleteTeam = false;
        this.permissionsLoaded = true;
        this.currentUserTeamId = null;
        this.currentTeam = null;
      }
    });
  }

  private isCompleteTeam(team: TeamDto | null): boolean {
    return team?.status === 'COMPLETE' && team?.captainId === this.currentUserId;
  }

  private mapTeamToCard(team: TeamDto, index: number): MatchRequestCard {
    const matchesWon = team.matchesWon ?? 0;
    const matchesLost = team.matchesLost ?? 0;
    const matchesDrawn = team.matchesDrawn ?? 0;
    const matchesCanceled = team.matchesCanceled ?? 0;
    const tarification = team.tarificationTerrain === 'GRATUIT' ? 'Gratuit' : 'Payant';

    return {
      id: team.id ?? index + 1,
      captainId: team.captainId ?? null,
      teamName: team.name ?? 'Équipe sans nom',
      logoUrl: team.logoUrl?.trim() || null,
      ratingLabel: `${matchesWon}V • ${matchesDrawn}N • ${matchesLost}P • ${matchesCanceled}A`,
      availableDateOnly: (team.availableDate ?? '').slice(0, 10) || null,
      levelCode: team.teamLevel ?? null,
      dateLabel: this.formatDate(team.availableDate),
      relativeDateLabel: `${this.formatTime(team.startTime)} - ${this.formatTime(team.endTime)}`,
      venueName: team.titleAddress || team.pitchAddress || 'Adresse non renseignée',
      venueMeta: team.city || 'Ville non définie',
      level: this.mapTeamLevel(team.teamLevel),
      format: tarification,
      price: team.tarificationTerrain === 'GRATUIT' ? '0 / pers' : `${team.prix ?? 0} / pers`,
      city: team.city ?? '',
      country: team.country ?? '',
      competitive: matchesWon >= matchesLost,
      heroClass: this.heroClasses[index % this.heroClasses.length],
      backgroundImage: this.backgroundImages[index % this.backgroundImages.length],
      logoClass: this.logoClasses[index % this.logoClasses.length],
      initials: this.getInitials(team.name)
    };
  }

  closeInviteModal(): void {
    if (this.inviteSubmitting) {
      return;
    }

    this.inviteModalVisible = false;
    this.invitedTeam = null;
    this.inviteError = null;
  }

  submitInvitation(): void {
    if (!this.invitedTeam?.captainId) {
      this.inviteError = 'Équipe invalide.';
      return;
    }

    if (!this.proposedDate || !this.proposedStartTime || !this.proposedEndTime) {
      this.inviteError = 'Veuillez compléter la date et les horaires proposés.';
      return;
    }

    this.inviteSubmitting = true;
    this.inviteError = null;

    const payload: CreateTeamInvitationRequest = {
      invitedUserId: this.invitedTeam.captainId,
      availableDate: this.proposedDate,
      startTime: `${this.proposedStartTime}:00`,
      endTime: `${this.proposedEndTime}:00`
    };

    this.invitationService.createInvitationMatch(payload).subscribe({ 
      next: () => {
        this.inviteSubmitting = false;
        this.inviteSuccess = `Invitation de match envoyée à ${this.invitedTeam?.teamName ?? 'l\'équipe'}`;
        this.closeInviteModal();
      },
      error: (err: any) => {
        this.inviteSubmitting = false;
        this.inviteError = err?.error?.errorMessage ?? err?.error?.message ?? "Impossible d'envoyer l'invitation.";
      }
    });
  }

  private formatInputTime(time?: string): string {
    if (!time) {
      return '';
    }

    return time.length >= 5 ? time.slice(0, 5) : time;
  }

  private mapTeamLevel(level: TeamDto['teamLevel']): string {
    switch (level) {
      case 'DEBUTANT':
        return 'Débutant';
      case 'AVANCE':
        return 'Avancé';
      case 'AMATEUR':
        return 'Amateur';
      default:
        return 'Non défini';
    }
  }

  private formatDate(dateValue?: string): string {
    if (!dateValue) {
      return 'Date non définie';
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue;
    }

    return parsedDate.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private formatTime(timeValue?: string): string {
    if (!timeValue) {
      return '--:--';
    }

    return timeValue.slice(0, 5);
  }

  private getInitials(name?: string): string {
    if (!name) {
      return 'TM';
    }
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
}
