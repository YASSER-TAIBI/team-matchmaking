import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

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
export class TeamComponent {
  readonly maxPlayers = 5;
  readonly maxSubstitutes = 3;

  readonly teamStats: TeamStat[] = [
    { label: 'Matchs', value: '30', icon: 'sports_soccer' },
    { label: 'Victoires', value: '14', icon: 'emoji_events', accent: true },
    { label: 'Égalités', value: '8', icon: 'balance', yellow: true },
    { label: 'Défaites', value: '8', icon: 'cancel', red: true },
    { label: 'Taux de victoire', value: '46.7%', icon: 'trending_up', accent: true },
    { label: 'Taux de défaites', value: '26.7%', icon: 'trending_down', red: true }
  ];

  readonly players: TeamPlayer[] = [
    {
      name: 'Alex Smith',
      number: '#10',
      role: 'Capitaine',
      badge: 'Attaquant',
      imageClass: 'team-member-card__avatar--alex',
      accent: true,
      stats: [
        { label: 'Matchs', value: '24' },
        { label: 'Buts', value: '8' }
      ]
    },
    {
      name: 'Jamie Doe',
      number: '#1',
      role: 'GK',
      badge: 'GK',
      imageClass: 'team-member-card__avatar--jamie',
      stats: [
        { label: 'Matchs', value: '42' },
        { label: 'Buts', value: '5' }
      ]
    },
    {
      name: 'Chris P.',
      number: '#7',
      role: 'Milieu',
      badge: 'Milieu',
      imageClass: 'team-member-card__avatar--chris',
      stats: [
        { label: 'Matchs', value: '20' },
        { label: 'Buts', value: '8' }
      ]
    },
    {
      name: 'Sarah M.',
      number: '#4',
      role: 'Défenseure',
      badge: 'Défenseure',
      imageClass: 'team-member-card__avatar--sarah',
      stats: [
        { label: 'Matchs', value: '38' },
        { label: 'Buts', value: '12' }
      ]
    }
  ];

  readonly substitutes: TeamPlayer[] = [
    {
      name: 'Marcus L.',
      number: '#12',
      role: 'Polyvalent',
      badge: 'Remplaçant',
      imageClass: 'team-member-card__avatar--marcus',
      stats: [
        { label: 'Matchs', value: '11' },
        { label: 'Buts', value: '7' }
      ]
    }
  ];

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

  // setTab(tab: TeamTab, event: Event): void {
  //   event.preventDefault();
  //   this.activeTab = tab;
  // }
}
