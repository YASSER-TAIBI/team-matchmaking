import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { AvailablePlayerDto } from '../../services/models/available-player-dto';
import { UserDto } from '../../services/models/user-dto';
import { HelperService } from '../../services/helper/helper.service';
import { UserService } from '../../services/users/user.service';

@Component({
  selector: 'app-available-players',
  standalone: true,
  imports: [CommonModule, MatDatepickerModule, MatNativeDateModule, MatInputModule],
  templateUrl: './available-players.component.html',
  styleUrl: './available-players.component.scss'
})
export class AvailablePlayersComponent implements OnInit {

  private helperService = inject(HelperService);
  private userService = inject(UserService);

  allPlayers: AvailablePlayerDto[] = [];
  players: AvailablePlayerDto[] = [];
  loading = false;
  error: string | null = null;

  selectedLevel: AvailablePlayerDto['level'] | null = null;
  selectedDate: Date | null = null;

  userCountry: string | null = null;
  userCity: string | null = null;
  currentUserId: number | null = null;

  ngOnInit(): void {
    this.currentUserId = this.helperService.userId;
    this.loadUserLocation();
    this.loadPlayers();
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
  }

  isCurrentUser(player: AvailablePlayerDto): boolean {
    const me = this.currentUserId;
    const other = player.userId ?? null;
    return me != null && other != null && me === other;
  }

  onMessageClick(): void {
    console.log('message ecrit');
  }

  onInviteClick(): void {
    console.log('inviter ecrit');
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
