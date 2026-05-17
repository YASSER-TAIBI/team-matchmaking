import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TeamMemberDto } from '../../services/models/team-member-dto';
import { TeamDto } from '../../services/models/team-dto';
import { TeamService } from '../../services/teams/team.service';

type TeamTab = 'roster' | 'matches' | 'stats' | 'schedule';

type TeamStat = {
  label: string;
  value: string;
  icon: string;
  accent?: boolean;
  red?: boolean;
  yellow?: boolean;
};

type TeamPlayer = {
  name: string;
  number: string;
  role: string;
  badge: string;
  imageClass: string;
  levelClass: string;
  accent?: boolean;
  stats: Array<{ label: string; value: string }>;
};

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  private teamService = inject(TeamService);

  readonly maxPlayers = 5;
  readonly maxSubstitutes = 3;
  readonly defaultTeamName = 'Mon équipe';

  team: TeamDto | null = null;
  members: TeamMemberDto[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadTeam();
  }

  get teamStats(): TeamStat[] {
    const totalMatches = this.team?.totalMatches ?? 0;
    const matchesWon = this.team?.matchesWon ?? 0;
    const matchesDrawn = this.team?.matchesDrawn ?? 0;
    const matchesLost = this.team?.matchesLost ?? 0;
    const winRate = totalMatches > 0 ? `${((matchesWon / totalMatches) * 100).toFixed(1)}%` : '0%';
    const lossRate = totalMatches > 0 ? `${((matchesLost / totalMatches) * 100).toFixed(1)}%` : '0%';

    return [
      { label: 'Matchs', value: `${totalMatches}`, icon: 'sports_soccer' },
      { label: 'Victoires', value: `${matchesWon}`, icon: 'emoji_events', accent: true },
      { label: 'Égalités', value: `${matchesDrawn}`, icon: 'balance', yellow: true },
      { label: 'Défaites', value: `${matchesLost}`, icon: 'cancel', red: true },
      { label: 'Taux de victoire', value: winRate, icon: 'trending_up', accent: true },
      { label: 'Taux de défaites', value: lossRate, icon: 'trending_down', red: true }
    ];
  }

  get players(): TeamPlayer[] {
    return this.members
      .filter((member) => member.selection !== 'SUBSTITUTE')
      .slice(0, this.maxPlayers)
      .map((member) => this.mapMemberToPlayer(member));
  }

  get substitutes(): TeamPlayer[] {
    return this.members
      .filter((member) => member.selection === 'SUBSTITUTE')
      .slice(0, this.maxSubstitutes)
      .map((member) => this.mapMemberToPlayer(member));
  }

  get teamName(): string {
    return this.team?.name?.trim() || this.defaultTeamName;
  }

  get teamLogoUrl(): string | null {
    return this.team?.logoUrl?.trim() || null;
  }

  get teamInitials(): string {
    return this.teamName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'ME';
  }

  get teamLocation(): string {
    const city = this.team?.city?.trim();
    const country = this.team?.country?.trim();

    if (city && country) {
      return `${city}, ${country}`;
    }

    return city || country || '-';
  }

  get teamCreatedYear(): string {
    if (!this.team?.createdDate) {
      return '-';
    }

    return new Date(this.team.createdDate).getFullYear().toString();
  }

  get isTeamConfirmed(): boolean {
    return this.team?.status === 'COMPLETE' || this.team?.status === 'IN_MATCH';
  }

  get playerCountLabel(): string {
    return `(${this.players.length}/${this.maxPlayers})`;
  }

  get emptyPlayerSlots(): number[] {
    const missingPlayers = Math.max(this.maxPlayers - this.players.length, 0);
    return Array.from({ length: missingPlayers }, (_, index) => index + 1);
  }

  get substituteCountLabel(): string {
    return `(${this.substitutes.length}/${this.maxSubstitutes})`;
  }

  get emptySubstituteSlots(): number[] {
    const missingSubstitutes = Math.max(this.maxSubstitutes - this.substitutes.length, 0);
    return Array.from({ length: missingSubstitutes }, (_, index) => index + 1);
  }

  getMemberInitials(player: TeamPlayer): string {
    return player.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }

  private loadTeam(): void {
    this.loading = true;
    this.error = null;

    this.teamService.findMyMemberTeam().subscribe({
      next: (team) => {
        this.team = team;
        this.members = team?.members ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement équipe', err);
        this.team = null;
        this.members = [];
        this.error = "Impossible de charger les données de l'équipe.";
        this.loading = false;
      }
    });
  }

  private mapMemberToPlayer(member: TeamMemberDto): TeamPlayer {
    const name = [member.firstName, member.lastName].filter(Boolean).join(' ').trim() || 'Joueur';

    return {
      name: this.capitalizeName(name),
      number: member.jerseyNumber != null ? `#${member.jerseyNumber}` : '-',
      role: this.memberRole(member),
      badge: this.memberBadge(member),
      imageClass: '',
      levelClass: this.levelBadgeClass(member.level),
      accent: !!member.captain,
      stats: [
        { label: 'Matchs', value: `${member.totalMatches ?? 0}` },
        { label: 'Niveau', value: this.levelLabel(member.level) }
      ]
    };
  }

  private capitalizeName(name: string): string {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private memberRole(member: TeamMemberDto): string {
    if (member.captain) {
      return 'Capitaine';
    }

    return this.positionLabel(member.position);
  }

  private memberBadge(member: TeamMemberDto): string {
    return this.positionLabel(member.position);
  }

  private positionLabel(position?: TeamMemberDto['position']): string {
    switch (position) {
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

  private levelLabel(level?: string): string {
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

  private levelBadgeClass(level?: string): string {
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

  // setTab(tab: TeamTab, event: Event): void {
  //   event.preventDefault();
  //   this.activeTab = tab;
  // }
}
