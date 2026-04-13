import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MATCHES_IMAGES } from '../../../assets/img/matches/matches-images';

interface MatchRequestCard {
  id: number;
  teamName: string;
  ratingLabel: string;
  status: 'new' | 'urgent' | 'friendly' | null;
  dateLabel: string;
  relativeDateLabel: string;
  venueName: string;
  venueMeta: string;
  level: string;
  format: string;
  price: string;
  city: string;
  competitive: boolean;
  heroClass: string;
  backgroundImage: string;
  logoClass: string;
  initials: string;
}

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent {
  readonly cards: MatchRequestCard[] = [
    {
      id: 1,
      teamName: 'Thunder FC',
      ratingLabel: '4.8 Rating',
      status: 'new',
      dateLabel: '12 Oct, 20:00 (1h30)',
      relativeDateLabel: 'Ce soir • Échauffement 19:45',
      venueName: 'Power League Shoreditch',
      venueMeta: 'Terrain 5 • Outdoor 4G',
      level: 'Intermédiaire',
      format: '5v5',
      price: '7.50€ / pers',
      city: 'London',
      competitive: true,
      heroClass: 'matches-card__media--night',
      backgroundImage: MATCHES_IMAGES.stadium_01,
      logoClass: 'matches-card__logo-inner--emerald',
      initials: 'TF'
    },
    {
      id: 2,
      teamName: 'Lightning Strikers',
      ratingLabel: '5.0 Rating',
      status: 'urgent',
      dateLabel: '13 Oct, 19:30 (1h)',
      relativeDateLabel: 'Demain',
      venueName: 'Goals Wembley',
      venueMeta: 'Terrain 2 • Outdoor 5G',
      level: 'Avancé',
      format: '7v7',
      price: 'Couvert',
      city: 'London',
      competitive: true,
      heroClass: 'matches-card__media--field',
      backgroundImage: MATCHES_IMAGES.stadium_02,
      logoClass: 'matches-card__logo-inner--violet',
      initials: 'LS'
    },
    {
      id: 3,
      teamName: 'Hackney Heroes',
      ratingLabel: 'Nouvelle équipe',
      status: null,
      dateLabel: '14 Oct, 18:00 (1h)',
      relativeDateLabel: 'Lundi',
      venueName: 'Hackney Marshes',
      venueMeta: 'South Field',
      level: 'Débutant',
      format: '11v11',
      price: 'Gratuit',
      city: 'London',
      competitive: false,
      heroClass: 'matches-card__media--strategy',
      backgroundImage: MATCHES_IMAGES.stadium_03,
      logoClass: 'matches-card__logo-inner--orange',
      initials: 'HH'
    },
    {
      id: 4,
      teamName: 'Camden Kickers',
      ratingLabel: '4.5 Rating',
      status: null,
      dateLabel: '15 Oct, 21:00 (1h)',
      relativeDateLabel: 'Mardi',
      venueName: 'Castle Haven',
      venueMeta: 'Camden Town',
      level: 'Open',
      format: '5v5',
      price: 'Sans frais',
      city: 'London',
      competitive: false,
      heroClass: 'matches-card__media--ball',
      backgroundImage: MATCHES_IMAGES.stadium_04,
      logoClass: 'matches-card__logo-inner--teal',
      initials: 'CK'
    },
    {
      id: 5,
      teamName: 'Islington Ballers',
      ratingLabel: '4.2 Rating',
      status: 'friendly',
      dateLabel: '16 Oct, 20:30 (1h)',
      relativeDateLabel: 'Mercredi',
      venueName: 'Market Road',
      venueMeta: 'Terrain 1',
      level: 'Confirmé',
      format: '5v5',
      price: 'Friendly',
      city: 'London',
      competitive: false,
      heroClass: 'matches-card__media--action',
      backgroundImage: MATCHES_IMAGES.stadium_05,
      logoClass: 'matches-card__logo-inner--purple',
      initials: 'IB'
    },
    {
      id: 6,
      teamName: 'Shoreditch Stars',
      ratingLabel: '4.7 Rating',
      status: null,
      dateLabel: '17 Oct, 19:00 (1h)',
      relativeDateLabel: 'Jeudi',
      venueName: 'Haggerston Park',
      venueMeta: 'Terrain 3',
      level: 'Casual',
      format: 'Mixte',
      price: '5€ / pers',
      city: 'London',
      competitive: false,
      heroClass: 'matches-card__media--stadium',
      backgroundImage: MATCHES_IMAGES.stadium_06,
      logoClass: 'matches-card__logo-inner--green',
      initials: 'SS'
    },
    {
      id: 7,
      teamName: 'Brixton Wolves',
      ratingLabel: '4.6 Rating',
      status: 'new',
      dateLabel: '18 Oct, 20:15 (1h)',
      relativeDateLabel: 'Vendredi',
      venueName: 'Brixton Rec',
      venueMeta: 'Pitch Central • Indoor',
      level: 'Intermédiaire',
      format: '5v5',
      price: '6€ / pers',
      city: 'London',
      competitive: true,
      heroClass: 'matches-card__media--night',
      backgroundImage: MATCHES_IMAGES.stadium_07,
      logoClass: 'matches-card__logo-inner--teal',
      initials: 'BW'
    },
    {
      id: 8,
      teamName: 'Northside Elite',
      ratingLabel: '4.9 Rating',
      status: 'urgent',
      dateLabel: '19 Oct, 18:45 (1h30)',
      relativeDateLabel: 'Samedi • Arrivée 18:15',
      venueName: 'Finchley Power Arena',
      venueMeta: 'Terrain 4 • Outdoor',
      level: 'Avancé',
      format: '5v5',
      price: '9€ / pers',
      city: 'London',
      competitive: true,
      heroClass: 'matches-card__media--field',
      backgroundImage: MATCHES_IMAGES.stadium_08,
      logoClass: 'matches-card__logo-inner--purple',
      initials: 'NE'
    },
    {
      id: 9,
      teamName: 'Paris Eleven',
      ratingLabel: '4.3 Rating',
      status: null,
      dateLabel: '20 Oct, 21:00 (1h)',
      relativeDateLabel: 'Dimanche',
      venueName: 'UrbanSoccer Puteaux',
      venueMeta: 'Terrain 6 • Indoor',
      level: 'Confirmé',
      format: '5v5',
      price: '8€ / pers',
      city: 'Paris',
      competitive: true,
      heroClass: 'matches-card__media--strategy',
      backgroundImage: MATCHES_IMAGES.stadium_09,
      logoClass: 'matches-card__logo-inner--violet',
      initials: 'PE'
    },
    {
      id: 10,
      teamName: 'Atlas Five',
      ratingLabel: 'Nouvelle équipe',
      status: 'friendly',
      dateLabel: '21 Oct, 19:30 (1h)',
      relativeDateLabel: 'Mardi prochain',
      venueName: 'Casablanca Arena',
      venueMeta: 'Terrain 2 • Mixte',
      level: 'Débutant',
      format: '5v5',
      price: 'Gratuit',
      city: 'Casablanca',
      competitive: false,
      heroClass: 'matches-card__media--action',
      backgroundImage: MATCHES_IMAGES.stadium_10,
      logoClass: 'matches-card__logo-inner--orange',
      initials: 'AF'
    },
    {
      id: 11,
      teamName: 'Canal United',
      ratingLabel: '4.4 Rating',
      status: null,
      dateLabel: '22 Oct, 22:00 (1h)',
      relativeDateLabel: 'Mercredi prochain',
      venueName: 'Regent’s Park Hub',
      venueMeta: 'Pitch 1 • Night session',
      level: 'Open',
      format: '7v7',
      price: '7€ / pers',
      city: 'London',
      competitive: false,
      heroClass: 'matches-card__media--ball',
      backgroundImage: MATCHES_IMAGES.stadium_11,
      logoClass: 'matches-card__logo-inner--green',
      initials: 'CU'
    },
    {
      id: 12,
      teamName: 'Royal Foot Club',
      ratingLabel: '4.8 Rating',
      status: 'new',
      dateLabel: '23 Oct, 20:00 (1h30)',
      relativeDateLabel: 'Jeudi prochain',
      venueName: 'Kensington Arena',
      venueMeta: 'Terrain VIP • Indoor',
      level: 'Confirmé',
      format: '5v5',
      price: '10€ / pers',
      city: 'London',
      competitive: true,
      heroClass: 'matches-card__media--stadium',
      backgroundImage: MATCHES_IMAGES.stadium_01,
      logoClass: 'matches-card__logo-inner--emerald',
      initials: 'RF'
    }
  ];

  selectedLocation = '';
  selectedDate = '';
  selectedFormat = '';
  appliedLocation = '';
  appliedDate = '';
  appliedFormat = '';
  visibleCount = 6;

  readonly locationOptions = ['London', 'Paris', 'Casablanca'];
  readonly dateOptions = ['Aujourd’hui', 'Cette semaine', 'Ce mois'];
  readonly formatOptions = ['5v5', '7v7', '11v11', 'Mixte'];

  get filteredCards(): MatchRequestCard[] {
    return this.cards.filter((card) => {
      const locationMatch = !this.appliedLocation || card.city === this.appliedLocation;
      const dateMatch = !this.appliedDate || this.matchesDateFilter(card.relativeDateLabel, this.appliedDate);
      const formatMatch = !this.appliedFormat || card.format === this.appliedFormat;
      return locationMatch && dateMatch && formatMatch;
    });
  }

  get visibleCards(): MatchRequestCard[] {
    return this.filteredCards.slice(0, this.visibleCount);
  }

  get canLoadMore(): boolean {
    return this.visibleCount < this.filteredCards.length;
  }

  searchMatches(): void {
    this.appliedLocation = this.selectedLocation;
    this.appliedDate = this.selectedDate;
    this.appliedFormat = this.selectedFormat;
    this.visibleCount = 6;
  }

  resetFilters(): void {
    this.selectedLocation = '';
    this.selectedDate = '';
    this.selectedFormat = '';
    this.appliedLocation = '';
    this.appliedDate = '';
    this.appliedFormat = '';
    this.visibleCount = 6;
  }

  loadMore(): void {
    this.visibleCount += 3;
  }

  trackByCardId(_index: number, card: MatchRequestCard): number {
    return card.id;
  }

  statusLabel(status: MatchRequestCard['status']): string {
    switch (status) {
      case 'new':
        return 'New';
      case 'urgent':
        return 'Urgent';
      case 'friendly':
        return 'Friendly';
      default:
        return '';
    }
  }

  statusClass(status: MatchRequestCard['status']): string {
    switch (status) {
      case 'new':
        return 'matches-card__badge--new';
      case 'urgent':
        return 'matches-card__badge--urgent';
      case 'friendly':
        return 'matches-card__badge--friendly';
      default:
        return '';
    }
  }

  private matchesDateFilter(relativeDateLabel: string, selectedDate: string): boolean {
    switch (selectedDate) {
      case 'Aujourd’hui':
        return relativeDateLabel.includes('Ce soir') || relativeDateLabel.includes('Aujourd’hui');
      case 'Cette semaine':
        return true;
      case 'Ce mois':
        return true;
      default:
        return true;
    }
  }
}
