import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TeamMemberDto } from '../../services/models/team-member-dto';
import { TeamDto } from '../../services/models/team-dto';
import { MatchService } from '../../services/match/match.service';
import { CurrentDualMatchDetailsDto } from '../../services/models/current-dual-match-details-dto';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent implements OnInit {

  private matchService = inject(MatchService);
  private sanitizer = inject(DomSanitizer);

  currentDualMatch: CurrentDualMatchDetailsDto | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.loadCurrentDualMatch();
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

  loadCurrentDualMatch(): void {
    this.isLoading = true;
    this.matchService.findMyCurrentDualMatchDetails().subscribe({
      next: (match) => {
        this.currentDualMatch = match;
        this.isLoading = false;
      },
      error: () => {
        this.currentDualMatch = null;
        this.isLoading = false;
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

  private capitalizeNamePart(value: string): string {
    return value
      .toLowerCase()
      .split(/([\s-]+)/)
      .map(part => /^[\s-]+$/.test(part) || !part ? part : part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}
