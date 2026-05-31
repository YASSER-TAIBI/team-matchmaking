import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { TeamMemberDto } from '../../services/models/team-member-dto';
import { TeamDto } from '../../services/models/team-dto';
import { MatchService } from '../../services/match/match.service';
import { CurrentDualMatchDetailsDto } from '../../services/models/current-dual-match-details-dto';
import { UserService } from '../../services/users/user.service';

type MatchActionTab = 'cancel' | 'finish';

interface FinishMatchPlayerEntry {
  memberId: number | string;
  team: 'my' | 'opponent';
  fullName: string;
  initials: string;
  role: string;
  played: boolean;
  goals: number;
  captain: boolean;
}

interface CancelConfirmationCaptain {
  team: 'my' | 'opponent';
  teamName: string;
  captainName: string;
  captainInitials: string;
  confirmed: boolean;
  isCurrentUserCaptain: boolean;
  canToggle: boolean;
}

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent implements OnInit {

  private matchService = inject(MatchService);
  private sanitizer = inject(DomSanitizer);
  private userService = inject(UserService);

  currentDualMatch: CurrentDualMatchDetailsDto | null = null;
  isLoading = false;
  isMatchActionModalOpen = false;
  isFinishResultModalOpen = false;
  isCancelConfirmationModalOpen = false;
  activeMatchActionTab: MatchActionTab = 'cancel';
  currentUserId: number | null = null;
  myTeamFinalScore = 0;
  opponentTeamFinalScore = 0;
  finishMatchNotes = '';
  finishMatchPlayers: FinishMatchPlayerEntry[] = [];
  cancelConfirmationCaptains: CancelConfirmationCaptain[] = [];
  showCancelToggleConfirmDialog = false;
  cancelTogglePending = false;
  cancelToggleTarget: CancelConfirmationCaptain | null = null;
  showFinishValidationWarningDialog = false;
  showFinishConfirmationDialog = false;

  ngOnInit(): void {
    this.loadCurrentUserContext();
  }

  get hasCurrentMatch(): boolean {
    return !!this.currentDualMatch?.matchId && !!this.currentDualMatch?.myTeam;
  }

  get myTeam(): TeamDto | null {
    return this.currentDualMatch?.myTeam ?? null;
  }

  get opponentTeam(): TeamDto | null {
    return this.currentDualMatch?.opponentTeam ?? null;
  }

  get matchDateLabel(): string {
    return this.formatDateLabel(this.currentDualMatch?.matchDate);
  }

  get matchTimeLabel(): string {
    const start = this.formatTime(this.currentDualMatch?.startTime);
    const end = this.formatTime(this.myTeam?.endTime);

    if (start === '--:--' && end === '--:--') {
      return '--:--';
    }

    if (end === '--:--') {
      return start;
    }

    return `${start} - ${end}`;
  }

  get matchLocation(): string {
    return this.currentDualMatch?.location ?? this.myTeam?.titleAddress ?? this.myTeam?.pitchAddress ?? 'Lieu non renseigné';
  }

  get matchAddressTitle(): string {
    return this.myTeam?.titleAddress ?? this.opponentTeam?.titleAddress ?? this.currentDualMatch?.location ?? 'Terrain';
  }

  get matchPitchAddress(): string {
    return this.myTeam?.pitchAddress ?? this.opponentTeam?.pitchAddress ?? this.matchAreaLabel;
  }

  get googleMapsEmbedUrl(): SafeResourceUrl {
    const query = encodeURIComponent(`${this.matchAddressTitle} ${this.matchPitchAddress}`.trim());
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.google.com/maps?q=${query}&z=16&output=embed`);
  }

  get matchAreaLabel(): string {
    const city = this.myTeam?.city ?? this.opponentTeam?.city;
    const country = this.myTeam?.country ?? this.opponentTeam?.country;

    return [city, country].filter(Boolean).join(', ') || 'Localisation non renseignée';
  }

  get entryFeeLabel(): string {
    const price = this.myTeam?.prix;
    return price != null ? `${Number(price).toFixed(2)} €` : 'Gratuit';
  }

  get levelLabel(): string {
    return this.formatTeamLevel(this.myTeam?.teamLevel ?? this.opponentTeam?.teamLevel);
  }

  get tarificationLabel(): string {
    return this.myTeam?.tarificationTerrain === 'PAYANT' ? 'Terrain payant' : 'Terrain gratuit';
  }

  get briefingText(): string {
    const homeTeam = this.myTeam?.name ?? 'Votre équipe';
    const awayTeam = this.opponentTeam?.name ?? 'l’équipe adverse';
    const place = this.matchLocation;
    return `Match dual programmé entre ${homeTeam} et ${awayTeam}. Rendez-vous à ${place}. Préparez votre onze de départ et vos remplaçants pour un match ${this.levelLabel.toLowerCase()}.`;
  }

  get isCurrentUserCaptain(): boolean {
    const captainId = this.myTeam?.captainId ?? null;
    return captainId != null && this.currentUserId != null && captainId === this.currentUserId;
  }

  get myTeamFinishPlayers(): FinishMatchPlayerEntry[] {
    return this.finishMatchPlayers.filter(player => player.team === 'my');
  }

  get opponentTeamFinishPlayers(): FinishMatchPlayerEntry[] {
    return this.finishMatchPlayers.filter(player => player.team === 'opponent');
  }

  get myTeamPlayedCount(): number {
    return this.myTeamFinishPlayers.filter(player => player.played).length;
  }

  get opponentTeamPlayedCount(): number {
    return this.opponentTeamFinishPlayers.filter(player => player.played).length;
  }

  get isCancelMatchTabDisabled(): boolean {
    const matchStart = this.getMatchStartDate();

    if (!matchStart) {
      return false;
    }

    return Date.now() >= matchStart.getTime() - (5 * 60 * 60 * 1000);
  }

  get isFinishMatchTabDisabled(): boolean {
    const matchStart = this.getMatchStartDate();

    if (!matchStart) {
      return true;
    }

    return Date.now() < matchStart.getTime() + (90 * 60 * 1000);
  }

  get cancelMatchAvailableFromLabel(): string {
    const matchStart = this.getMatchStartDate();

    if (!matchStart) {
      return 'Disponible tant que l’horaire du match permet encore une annulation.';
    }

    const cancelDeadline = new Date(matchStart.getTime() - (5 * 60 * 60 * 1000));
    return `Disponible jusqu’au ${this.formatDateTimeLabel(cancelDeadline)}.`;
  }

  get finishMatchAvailableFromLabel(): string {
    const matchStart = this.getMatchStartDate();

    if (!matchStart) {
      return 'Disponible 1h30 après le début du match.';
    }

    const finishAvailableAt = new Date(matchStart.getTime() + (90 * 60 * 1000));
    return `Disponible à partir du ${this.formatDateTimeLabel(finishAvailableAt)}.`;
  }

  openMatchActionModal(): void {
    if (!this.isCurrentUserCaptain) {
      return;
    }

    this.isMatchActionModalOpen = true;

    if (!this.isCancelMatchTabDisabled) {
      this.activeMatchActionTab = 'cancel';
      return;
    }

    if (!this.isFinishMatchTabDisabled) {
      this.activeMatchActionTab = 'finish';
      return;
    }

    this.activeMatchActionTab = 'cancel';
  }

  closeMatchActionModal(): void {
    this.isMatchActionModalOpen = false;
  }

  openFinishResultModal(): void {
    if (!this.isCurrentUserCaptain || this.isFinishMatchTabDisabled) {
      return;
    }

    this.isMatchActionModalOpen = false;
    this.initializeFinishMatchForm();
    this.isFinishResultModalOpen = true;
  }

  closeFinishResultModal(): void {
    this.isFinishResultModalOpen = false;
    this.showFinishValidationWarningDialog = false;
    this.showFinishConfirmationDialog = false;
  }

  openCancelConfirmationModal(): void {
    if (!this.isCurrentUserCaptain || this.isCancelMatchTabDisabled) {
      return;
    }

    this.isMatchActionModalOpen = false;
    this.initializeCancelConfirmationState();
    this.isCancelConfirmationModalOpen = true;
  }

  closeCancelConfirmationModal(): void {
    this.isCancelConfirmationModalOpen = false;
  }

  toggleCancelCaptainConfirmation(captain: CancelConfirmationCaptain): void {
    if (!captain.canToggle || this.cancelTogglePending) {
      return;
    }

    this.cancelToggleTarget = captain;
    this.isCancelConfirmationModalOpen = false;
    this.showCancelToggleConfirmDialog = true;
  }

  confirmCancelCaptainConfirmation(): void {
    const captain = this.cancelToggleTarget;
    if (!captain || this.cancelTogglePending) {
      return;
    }

    const nextValue = !captain.confirmed;

    this.cancelTogglePending = true;
    this.showCancelToggleConfirmDialog = false;

    this.matchService.confirmCurrentDualMatchCancellation(nextValue).subscribe({
      next: (updatedMatch) => {
        // Si le backend renvoie null, cela veut dire que la seconde confirmation a déclenché l'annulation complète du match.
        if (!updatedMatch) {
          this.currentDualMatch = null;
          this.cancelConfirmationCaptains = [];
          this.cancelTogglePending = false;
          this.cancelToggleTarget = null;
          this.isCancelConfirmationModalOpen = false;
          return;
        }

        // Sinon, on reste dans l'état intermédiaire : seule la confirmation courante a été mémorisée.
        this.currentDualMatch = updatedMatch;
        this.initializeCancelConfirmationState();
        this.cancelTogglePending = false;
        this.cancelToggleTarget = null;
        this.isCancelConfirmationModalOpen = true;
      },
      error: (err: any) => {
        console.error('Erreur lors de la mise à jour de la demande d’annulation', err);
        this.cancelTogglePending = false;
        this.cancelToggleTarget = null;
        this.isCancelConfirmationModalOpen = true;
      }
    });
  }

  cancelCancelCaptainConfirmation(): void {
    if (this.cancelTogglePending) {
      return;
    }

    this.showCancelToggleConfirmDialog = false;
    this.isCancelConfirmationModalOpen = true;
    this.cancelToggleTarget = null;
  }

  get cancelToggleDialogTitle(): string {
    return this.cancelToggleTarget?.confirmed ? 'Retirer la demande d’annulation' : 'Confirmer la demande d’annulation';
  }

  get cancelToggleDialogMessage(): string {
    return this.cancelToggleTarget?.confirmed
      ? 'Voulez-vous vraiment retirer votre demande d’annulation du match ?'
      : 'Voulez-vous vraiment annuler le match ?';
  }

  get cancelToggleDialogDetails(): string[] {
    return this.cancelToggleTarget?.confirmed
      ? ['Votre équipe ne sera plus marquée comme demandeuse de l’annulation.', 'La confirmation de l’autre capitaine reste inchangée.']
      : ['Votre équipe sera marquée comme demandeuse de l’annulation.', 'Le match ne pourra être annulé que lorsque les deux capitaines auront confirmé.'];
  }

  get cancelToggleDialogConfirmText(): string {
    return this.cancelToggleTarget?.confirmed ? 'Retirer la demande' : 'Confirmer';
  }

  incrementPlayerGoal(player: FinishMatchPlayerEntry): void {
    if (!player.played) {
      player.played = true;
    }

    player.goals += 1;
  }

  decrementPlayerGoal(player: FinishMatchPlayerEntry): void {
    player.goals = Math.max(0, player.goals - 1);
  }

  onPlayerParticipationChange(player: FinishMatchPlayerEntry): void {
    if (!player.played) {
      player.goals = 0;
    }
  }

  submitFinishResult(): void {
    this.isFinishResultModalOpen = false;

    const hasMinimumPlayersPerTeam = this.myTeamPlayedCount >= 5 && this.opponentTeamPlayedCount >= 5;

    if (!hasMinimumPlayersPerTeam) {
      this.showFinishConfirmationDialog = false;
      this.showFinishValidationWarningDialog = true;
      return;
    }

    this.showFinishValidationWarningDialog = false;
    this.showFinishConfirmationDialog = true;
  }

  cancelFinishValidationWarning(): void {
    this.showFinishValidationWarningDialog = false;
  }

  confirmFinishValidationWarning(): void {
    this.showFinishValidationWarningDialog = false;
    this.isFinishResultModalOpen = true;
  }

  cancelFinishConfirmation(): void {
    this.showFinishConfirmationDialog = false;
  }

  confirmFinishResult(): void {
    this.showFinishConfirmationDialog = false;
  }

  get finishValidationWarningDetails(): string[] {
    return [
      `${this.myTeam?.name ?? 'Votre équipe'} : ${this.myTeamPlayedCount} joueur(s) sélectionné(s).`,
      `${this.opponentTeam?.name ?? 'Équipe adverse'} : ${this.opponentTeamPlayedCount} joueur(s) sélectionné(s).`,
      'Vous devez sélectionner minimum 5 joueurs par équipe.'
    ];
  }

  get finishConfirmationDetails(): string[] {
    return [
      'Les informations saisies pour le résultat final du match seront bien prises en compte après votre confirmation.',
      'Le score du match, les joueurs ayant participé sur le terrain ainsi que les buteurs enregistrés seront sauvegardés.',
      'Vous pourrez ensuite consulter ces informations dans l’onglet Historique.'
    ];
  }

  setMatchActionTab(tab: MatchActionTab): void {
    if (!this.isCurrentUserCaptain) {
      return;
    }

    if (tab === 'cancel' && this.isCancelMatchTabDisabled) {
      return;
    }

    if (tab === 'finish' && this.isFinishMatchTabDisabled) {
      return;
    }

    this.activeMatchActionTab = tab;
  }

  loadCurrentDualMatch(): void {
    this.isLoading = true;
    this.matchService.findMyCurrentDualMatchDetails().subscribe({
      next: (match) => {
        this.currentDualMatch = match;
        this.initializeFinishMatchForm();
        this.initializeCancelConfirmationState();
        this.isLoading = false;
      },
      error: () => {
        this.currentDualMatch = null;
        this.finishMatchPlayers = [];
        this.cancelConfirmationCaptains = [];
        this.cancelToggleTarget = null;
        this.showCancelToggleConfirmDialog = false;
        this.showFinishValidationWarningDialog = false;
        this.showFinishConfirmationDialog = false;
        this.cancelTogglePending = false;
        this.isLoading = false;
      }
    });
  }

  private loadCurrentUserContext(): void {
    this.userService.findMe().subscribe({
      next: (user) => {
        this.currentUserId = user?.id ?? null;
        this.loadCurrentDualMatch();
      },
      error: () => {
        this.currentUserId = null;
        this.loadCurrentDualMatch();
      }
    });
  }

  getTeamMembers(team: TeamDto | null | undefined): TeamMemberDto[] {
    return (team?.members ?? []).slice();
  }

  getStarters(team: TeamDto | null | undefined): TeamMemberDto[] {
    const starters = this.getTeamMembers(team).filter(member => member.selection === 'STARTER');
    return starters.length > 0 ? starters : this.getTeamMembers(team);
  }

  getSubstitutes(team: TeamDto | null | undefined): TeamMemberDto[] {
    return this.getTeamMembers(team).filter(member => member.selection === 'SUBSTITUTE');
  }

  getTeamInitials(name?: string): string {
    const value = (name ?? '').trim();
    if (!value) {
      return '--';
    }

    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  getMemberInitials(member: TeamMemberDto): string {
    return [member.firstName, member.lastName]
      .filter(Boolean)
      .map(part => String(part).charAt(0).toUpperCase())
      .join('') || '--';
  }

  getMemberFullName(member: TeamMemberDto): string {
    const fullName = [member.firstName, member.lastName]
      .filter(Boolean)
      .map(part => this.capitalizeNamePart(String(part)))
      .join(' ')
      .trim();
    return fullName;
  }

  getMemberRole(member: TeamMemberDto): string {
    switch (member.position) {
      case 'GOALKEEPER':
        return 'Gardien';
      case 'DEFENDER':
        return 'Défenseur';
      case 'MIDFIELDER':
        return 'Milieu';
      case 'ATTACKER':
        return 'Attaquant';
      default:
        return 'Joueur';
    }
  }

  isAccentMember(member: TeamMemberDto): boolean {
    return !!member.captain || member.position === 'GOALKEEPER';
  }

  private formatDateLabel(date?: string): string {
    if (!date) {
      return 'Date non renseignée';
    }

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) {
      return date;
    }

    const weekday = value.toLocaleDateString('fr-FR', { weekday: 'long' });
    const day = value.toLocaleDateString('fr-FR', { day: '2-digit' });
    const month = value.toLocaleDateString('fr-FR', { month: 'short' });
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} ${month}`;
  }

  private formatTime(time?: string): string {
    if (!time) {
      return '--:--';
    }

    return time.length >= 5 ? time.slice(0, 5) : time;
  }

  private formatTeamLevel(level?: TeamDto['teamLevel']): string {
    switch (level) {
      case 'DEBUTANT':
        return 'Débutant';
      case 'AMATEUR':
        return 'Amateur';
      case 'AVANCE':
        return 'Avancé';
      default:
        return 'Match privé';
    }
  }

  private initializeFinishMatchForm(): void {
    this.myTeamFinalScore = 0;
    this.opponentTeamFinalScore = 0;
    this.finishMatchNotes = '';
    this.finishMatchPlayers = [
      ...this.buildFinishMatchEntries(this.myTeam, 'my'),
      ...this.buildFinishMatchEntries(this.opponentTeam, 'opponent')
    ];
  }

  private initializeCancelConfirmationState(): void {
    this.cancelConfirmationCaptains = [
      this.buildCancelCaptain(this.myTeam, 'my'),
      this.buildCancelCaptain(this.opponentTeam, 'opponent')
    ].filter((captain): captain is CancelConfirmationCaptain => captain !== null);
  }

  private buildFinishMatchEntries(team: TeamDto | null, side: 'my' | 'opponent'): FinishMatchPlayerEntry[] {
    return (team?.members ?? []).map((member, index) => ({
      memberId: member.id ?? `${side}-${index}`,
      team: side,
      fullName: this.getMemberFullName(member),
      initials: this.getMemberInitials(member),
      role: this.getMemberRole(member),
      played: member.selection === 'STARTER',
      goals: 0,
      captain: !!member.captain
    }));
  }

  private buildCancelCaptain(team: TeamDto | null, side: 'my' | 'opponent'): CancelConfirmationCaptain | null {
    if (!team) {
      return null;
    }

    const captain = (team.members ?? []).find(member => !!member.captain) ?? null;
    const captainName = captain ? this.getMemberFullName(captain) : 'Capitaine en attente';
    const captainInitials = captain ? this.getMemberInitials(captain) : '--';
    const confirmed = !!team.isAnnuleMatch;

    return {
      team: side,
      teamName: team.name ?? (side === 'my' ? 'Votre équipe' : 'Équipe adverse'),
      captainName,
      captainInitials,
      confirmed,
      isCurrentUserCaptain: side === 'my' && this.isCurrentUserCaptain,
      canToggle: side === 'my' && this.isCurrentUserCaptain
    };
  }

  private getMatchStartDate(): Date | null {
    const matchDate = this.currentDualMatch?.matchDate;
    const startTime = this.currentDualMatch?.startTime;

    if (!matchDate || !startTime) {
      return null;
    }

    const normalizedDate = matchDate.length >= 10 ? matchDate.slice(0, 10) : matchDate;
    const normalizedTime = startTime.length >= 5 ? startTime.slice(0, 5) : startTime;
    const value = new Date(`${normalizedDate}T${normalizedTime}:00`);

    return Number.isNaN(value.getTime()) ? null : value;
  }

  private formatDateTimeLabel(value: Date): string {
    const dateLabel = value.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeLabel = value.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${dateLabel} à ${timeLabel}`;
  }

  private capitalizeNamePart(value: string): string {
    return value
      .toLowerCase()
      .split(/([\s-]+)/)
      .map(part => /^[\s-]+$/.test(part) || !part ? part : part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}
