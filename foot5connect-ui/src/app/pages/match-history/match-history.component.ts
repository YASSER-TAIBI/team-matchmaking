import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type MatchResult = 'won' | 'lost' | 'draw';

interface MatchHistoryPlayer {
  name: string;
  goals?: number;
  isCaptain?: boolean;
  isCurrentUser?: boolean;
  isSubstitute?: boolean;
}

interface MatchHistoryTeam {
  name: string;
  score: number;
  initials: string;
  goals: MatchHistoryPlayer[];
  roster: MatchHistoryPlayer[];
}

interface MatchHistoryItem {
  id: number;
  period: string;
  relation: string;
  result: MatchResult;
  statusLabel: string;
  myTeam: MatchHistoryTeam;
  opponent: MatchHistoryTeam;
  location: string;
  pitchType: string;
  fee: string;
  participation: string;
  notes: string;
  expanded: boolean;
}

@Component({
  selector: 'app-match-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-history.component.html',
  styleUrl: './match-history.component.scss'
})
export class MatchHistoryComponent {
  activeFilter: 'all' | MatchResult = 'all';

  readonly filters: Array<{ value: 'all' | MatchResult; label: string }> = [
    { value: 'all', label: 'Tous' },
    { value: 'won', label: 'Victoires' },
    { value: 'lost', label: 'Défaites' },
    { value: 'draw', label: 'Nuls' }
  ];

  readonly matches: MatchHistoryItem[] = [
    {
      id: 1,
      period: 'Aujourd\'hui',
      relation: 'Mon équipe',
      result: 'won',
      statusLabel: 'Gagné',
      myTeam: {
        name: 'Obsidian FC',
        score: 4,
        initials: 'OF',
        goals: [
          { name: 'J. Doe', goals: 2 },
          { name: 'M. Smith', goals: 1 },
          { name: 'T. Silva', goals: 1, isCaptain: true }
        ],
        roster: [
          { name: 'T. Silva', isCaptain: true },
          { name: 'Vous', isCurrentUser: true },
          { name: 'J. Doe' },
          { name: 'M. Smith' },
          { name: 'K. Chen' },
          { name: 'L. Gomez' },
          { name: 'A. Ndiaye', isSubstitute: true }
        ]
      },
      opponent: {
        name: 'Metro City',
        score: 2,
        initials: 'MC',
        goals: [
          { name: 'R. Blake', goals: 1 },
          { name: 'D. Vance', goals: 1 }
        ],
        roster: [
          { name: 'S. Wright', isCaptain: true }
        ]
      },
      location: 'Arena 1, Secteur 4',
      pitchType: '7v7 Turf',
      fee: '120 € partagé',
      participation: 'A joué (60m)',
      notes: 'Deuxième mi-temps intense. Metro City a poussé fort mais la défense est restée solide.',
      expanded: true
    },
    {
      id: 2,
      period: 'Hier',
      relation: 'Invité',
      result: 'lost',
      statusLabel: 'Perdu',
      myTeam: {
        name: 'Thunder FC',
        score: 1,
        initials: 'TF',
        goals: [{ name: 'A. Karim', goals: 1 }],
        roster: [{ name: 'Vous', isCurrentUser: true }, { name: 'A. Karim' }]
      },
      opponent: {
        name: 'Obsidian FC',
        score: 3,
        initials: 'OF',
        goals: [{ name: 'J. Doe', goals: 2 }, { name: 'K. Chen', goals: 1 }],
        roster: [{ name: 'T. Silva', isCaptain: true }, { name: 'J. Doe' }]
      },
      location: 'Five Zone, Terrain B',
      pitchType: '5v5 Indoor',
      fee: '90 € partagé',
      participation: 'A joué (45m)',
      notes: 'Match rapide avec beaucoup de transitions. Bon rythme malgré le résultat.',
      expanded: false
    },
    {
      id: 3,
      period: 'Cette semaine',
      relation: 'Mon équipe',
      result: 'draw',
      statusLabel: 'Nul',
      myTeam: {
        name: 'Obsidian FC',
        score: 2,
        initials: 'OF',
        goals: [{ name: 'M. Smith', goals: 1 }, { name: 'Vous', goals: 1, isCurrentUser: true }],
        roster: [{ name: 'T. Silva', isCaptain: true }, { name: 'Vous', isCurrentUser: true }, { name: 'M. Smith' }]
      },
      opponent: {
        name: 'North Lions',
        score: 2,
        initials: 'NL',
        goals: [{ name: 'Y. Benali', goals: 2 }],
        roster: [{ name: 'Y. Benali', isCaptain: true }]
      },
      location: 'Urban Soccer, Terrain 2',
      pitchType: '6v6 Synthétique',
      fee: 'Gratuit',
      participation: 'A joué (50m)',
      notes: 'Match équilibré, beaucoup d’occasions des deux côtés et une belle réaction en fin de partie.',
      expanded: false
    }
  ];

  get filteredMatches(): MatchHistoryItem[] {
    if (this.activeFilter === 'all') {
      return this.matches;
    }

    return this.matches.filter((match) => match.result === this.activeFilter);
  }

  setFilter(filter: 'all' | MatchResult): void {
    this.activeFilter = filter;
  }

  toggleMatch(match: MatchHistoryItem): void {
    match.expanded = !match.expanded;
  }

  getResultIcon(result: MatchResult): string {
    if (result === 'won') {
      return 'check_circle';
    }

    if (result === 'lost') {
      return 'cancel';
    }

    return 'remove_circle';
  }
}
