import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TeamService } from '../../services/teams/team.service';

@Component({
  selector: 'app-team-conditions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-conditions.component.html',
  styleUrl: './team-conditions.component.scss'
})
export class TeamConditionsComponent {
  private router = inject(Router);
  private teamService = inject(TeamService);

  accepted = false;

  onAcceptedChange(event: Event): void {
    const checked = (event.target as HTMLInputElement | null)?.checked ?? false;
    this.accepted = checked;
  }

  onCreateTeam(): void {
    if (!this.accepted) {
      return;
    }
    this.teamService.createTeam().subscribe({
      next: () => this.router.navigate(['/user/team/create']),
      error: (err) => console.error('Erreur lors de la création de l\'équipe', err)
    });
  }
}
