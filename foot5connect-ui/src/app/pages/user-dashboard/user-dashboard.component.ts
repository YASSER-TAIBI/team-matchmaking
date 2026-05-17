import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { HelperService } from '../../services/helper/helper.service';
import { RouterLink } from '@angular/router';
import { UserDto } from '../../services/models/user-dto';
import { UserService } from '../../services/users/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AvailabilityDialogComponent, AvailabilityDialogResult } from '../../components/availability-dialog/availability-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { CurrentMatchDto } from '../../services/models/current-match-dto';
import { MatchService } from '../../services/match/match.service';


@Component({
  selector: 'app-user-dashboard',
  imports: [RouterLink, CommonModule, ConfirmDialogComponent],
  standalone: true,
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {

  private userService = inject(UserService);
  private matchService = inject(MatchService);
  private helperService = inject(HelperService);
  private dialog = inject(MatDialog);

  user: UserDto | null = null;
  isInMatch = false;
  currentMatch: CurrentMatchDto | null = null;
  isLoadingCurrentMatch = false;
  showConfirmUnavailable = false;
  private unavailableCheckbox: HTMLInputElement | null = null;

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadInMatchState();
    this.loadCurrentMatch();
  }

  loadCurrentUser(): void {
    this.userService.findMe().subscribe({
      next: (res) => {
       this.user = res;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  private loadCurrentMatch(): void {
    this.isLoadingCurrentMatch = true;
    this.matchService.findMyCurrentMatch().subscribe({
      next: (match) => {
        this.currentMatch = match;
        this.isLoadingCurrentMatch = false;
      },
      error: (err) => {
        console.log(err);
        this.currentMatch = null;
        this.isLoadingCurrentMatch = false;
      }
    });
  }

  get firstName(): string {
    const value = this.helperService.userFullName ?? '';
    const first = value.trim().split(/\s+/).filter(Boolean)[0] ?? '';
    return first
      ? first.charAt(0).toUpperCase() + first.slice(1)
      : '';
  }

  get levelLabel(): string {
    const level = this.user?.level;
    if (!level) {
      return '-';
    }
    switch (level) {
      case 'DEBUTANT':
        return 'Débutant';
      case 'INTERMEDIAIRE':
        return 'Intermédiaire';
      case 'AVANCE':
        return 'Avancé';
      case 'CONFIRMER':
        return 'Confirmé';
      default:
        return String(level);
    }
  }

  get levelBadgeClass(): string {
    const level = this.user?.level;
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

  get matchesCount(): number {
    return this.user?.totalMatches ?? 0;
  }

  get goalsCount(): number {
    return this.user?.totalGoals ?? 0;
  }

  get currentMatchTopbarLabel(): string {
    if (!this.currentMatch?.matchDate && !this.currentMatch?.startTime) {
      return '-';
    }

    const datePart = this.currentMatch?.matchDate
      ? this.formatDateLabel(this.currentMatch.matchDate)
      : '';
    const timePart = this.currentMatch?.startTime
      ? `À ${this.formatTime(this.currentMatch.startTime)}`
      : '';

    return [datePart, timePart].filter(Boolean).join(' • ');
  }

  get matchLocation(): string {
    return this.currentMatch?.location ?? '-';
  }

  get myTeamName(): string {
    return this.currentMatch?.myTeamName ?? 'Mon équipe';
  }

  get myTeamLogoUrl(): string | null {
    return this.currentMatch?.myTeamLogoUrl?.trim() || null;
  }

  get opponentTeamName(): string {
    return this.currentMatch?.opponentTeamName ?? 'Équipe adverse';
  }

  get opponentTeamLogoUrl(): string | null {
    return this.currentMatch?.opponentTeamLogoUrl?.trim() || null;
  }

  get myTeamInitials(): string {
    return this.getInitials(this.myTeamName);
  }

  get opponentTeamInitials(): string {
    return this.getInitials(this.opponentTeamName);
  }

  get availabilityLabel(): string {
    const status = this.user?.availabilityStatus;
    if (!status) {
      return '-';
    }
    switch (status) {
      case 'DISPONIBLE':
        return 'DISPONIBLE';
      case 'INDISPONIBLE':
        return 'INDISPONIBLE';
      case 'EN_EQUIPE':
        return 'EN ÉQUIPE';
      default:
        return String(status);
    }
  }

  private loadInMatchState(): void {
    this.userService.isAuthenticatedUserInMatch().subscribe({
      next: (value) => {
        this.isInMatch = value;
      },
      error: (err) => {
        console.log(err);
        this.isInMatch = false;
      }
    });
  }

  get isAvailabilityChecked(): boolean {
    const status = this.user?.availabilityStatus;
    return status === 'DISPONIBLE' || status === 'EN_EQUIPE';
  }

  get isAvailabilityDisabled(): boolean {
    const status = this.user?.availabilityStatus;
    return status === 'EN_EQUIPE';
  }

  onAvailabilityToggle(event: Event): void {
    const status = this.user?.availabilityStatus;
    if (!this.user || status === 'EN_EQUIPE') {
      return;
    }

    const checked = (event.target as HTMLInputElement).checked;

    if (status === 'INDISPONIBLE' && checked) {
      this.openAvailabilityDialog(event.target as HTMLInputElement);
      return;
    }

    if (status === 'DISPONIBLE' && !checked) {
      this.unavailableCheckbox = event.target as HTMLInputElement;
      this.showConfirmUnavailable = true;
      return;
    }

    this.user = {
      ...this.user,
      availabilityStatus: checked ? 'DISPONIBLE' : 'INDISPONIBLE'
    };
  }

  confirmUnavailable(): void {
    this.showConfirmUnavailable = false;
    if (!this.user || !this.unavailableCheckbox) return;

    const userId = this.user.id as number;
    const checkbox = this.unavailableCheckbox;

    this.userService.setUnavailable(userId).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser as UserDto;
        checkbox.checked = false;
      },
      error: (err: any) => {
        console.log(err);
        checkbox.checked = true;
      }
    });
  }

  cancelUnavailable(): void {
    this.showConfirmUnavailable = false;
    if (this.unavailableCheckbox) {
      this.unavailableCheckbox.checked = true;
    }
  }

  private openAvailabilityDialog(checkbox: HTMLInputElement): void {
    const dialogRef = this.dialog.open<AvailabilityDialogComponent, undefined, AvailabilityDialogResult | null>(
      AvailabilityDialogComponent,
      {
        width: '620px',
        height: '520px',
        panelClass: 'availability-dialog-panel'
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        checkbox.checked = false;
        return;
      }

      console.log('[Availability]', {
        availabilityDate: result.availabilityDate,
        startTime: result.startTime,
        endTime: result.endTime
      });

      if (!this.user) {
        return;
      }

      const userId = this.user.id as number;
      const availableDate = this.toIsoDate(result.availabilityDate);
      this.userService.saveAvailability(userId, {
        availableDate,
        startTime: result.startTime,
        endTime: result.endTime
      }).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser as UserDto;
          checkbox.checked = true;
        },
        error: (err) => {
          console.log(err);
          checkbox.checked = false;
        }
      });
    });
  }

  private toIsoDate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateLabel(date?: string): string {
    if (!date) {
      return '-';
    }

    const value = new Date(date);
    if (Number.isNaN(value.getTime())) {
      return date;
    }

    const weekday = value.toLocaleDateString('fr-FR', { weekday: 'short' });
    const day = value.toLocaleDateString('fr-FR', { day: '2-digit' });
    const month = value.toLocaleDateString('fr-FR', { month: 'short' });
    const normalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('.', '');
    return `${normalizedWeekday} ${day} ${month}`;
  }

  private formatTime(time?: string): string {
    if (!time) {
      return '--:--';
    }

    return time.length >= 5 ? `${time.slice(0, 2)}h${time.slice(3, 5)}` : time;
  }

  private getInitials(name: string): string {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    if (parts.length === 0) {
      return '--';
    }

    return parts.map(part => part.charAt(0).toUpperCase()).join('');
  }
}
