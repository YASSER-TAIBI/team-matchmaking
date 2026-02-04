import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { HelperService } from '../../services/helper/helper.service';
import { RouterLink } from '@angular/router';
import { UserDto } from '../../services/models/user-dto';
import { UserService } from '../../services/users/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AvailabilityDialogComponent, AvailabilityDialogResult } from '../../components/availability-dialog/availability-dialog.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-user-dashboard',
  imports: [RouterLink, CommonModule],
  standalone: true,
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {

  private userService = inject(UserService);
  private helperService = inject(HelperService);
  private dialog = inject(MatDialog);

  user: UserDto | null = null;

  ngOnInit(): void {
    this.findByUserId();
  }

  findByUserId(){
    this.userService.findById(this.helperService.userId!).subscribe({
      next: (res) => {
       this.user = res;
      },
      error: (err) => {
        console.log(err);
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
      const checkbox = event.target as HTMLInputElement;
      const userId = this.user.id as number;
      const dialogRef = this.dialog.open<ConfirmDialogComponent, { message: string }, boolean>(
        ConfirmDialogComponent,
        {
          data: {
            message: 'Êtes-vous sûr(e) de vouloir passer votre profil en indisponible ?'
          },
          panelClass: ['availability-dialog-panel', 'confirm-dialog-panel']
        }
      );

      dialogRef.afterClosed().subscribe((confirmed) => {
        if (!confirmed) {
          checkbox.checked = true;
          return;
        }

        this.userService.setUnavailable(userId).subscribe({
          next: (updatedUser) => {
            this.user = updatedUser as UserDto;
            checkbox.checked = false;
          },
          error: (err) => {
            console.log(err);
            checkbox.checked = true;
          }
        });
      });
      return;
    }

    this.user = {
      ...this.user,
      availabilityStatus: checked ? 'DISPONIBLE' : 'INDISPONIBLE'
    };
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
}
