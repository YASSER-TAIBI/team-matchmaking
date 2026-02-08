import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TeamService } from '../../services/teams/team.service';
import { TeamDto } from '../../services/models/team-dto';
import { TeamMemberDto } from '../../services/models/team-member-dto';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

type TeamCreateTab = 'creation' | 'formation' | 'disponibilite' | 'historique';

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, ConfirmDialogComponent],
  templateUrl: './team-create.component.html',
  styleUrl: './team-create.component.scss'
})
export class TeamCreateComponent implements OnInit {
  private teamService = inject(TeamService);

  activeTab: TeamCreateTab = 'creation';
  team: TeamDto | null = null;
  members: TeamMemberDto[] = [];

  isEditingIdentity = false;
  editName = '';
  editLogoUrl = '';
  showConfirmDialog = false;

  ngOnInit(): void {
    this.teamService.findMyTeam().subscribe({
      next: (data) => {
        this.team = data;
        this.members = data?.members ?? [];
      },
      error: (err) => console.error('Erreur chargement équipe', err)
    });
  }

  startEditIdentity(): void {
    this.editName = this.team?.name ?? '';
    this.editLogoUrl = this.team?.logoUrl ?? '';
    this.isEditingIdentity = true;
  }

  cancelEditIdentity(): void {
    this.isEditingIdentity = false;
  }

  saveIdentity(): void {
    this.showConfirmDialog = true;
  }

  confirmSave(): void {
    this.showConfirmDialog = false;
    if (!this.team) return;
    this.teamService.updateTeam({ name: this.editName, logoUrl: this.editLogoUrl }).subscribe({
      next: (updated: TeamDto) => {
        this.team = updated;
        this.isEditingIdentity = false;
      },
      error: (err: any) => console.error('Erreur lors de la mise à jour', err)
    });
  }

  cancelConfirm(): void {
    this.showConfirmDialog = false;
  }

  setTab(tab: TeamCreateTab, event?: Event): void {
    event?.preventDefault();
    this.activeTab = tab;
  }

  getMemberFullName(m: TeamMemberDto): string {
    const first = (m.firstName ?? '').charAt(0).toUpperCase() + (m.firstName ?? '').slice(1).toLowerCase();
    const last = (m.lastName ?? '').charAt(0).toUpperCase() + (m.lastName ?? '').slice(1).toLowerCase();
    return `${first} ${last}`.trim() || 'Joueur';
  }

  getMemberInitials(m: TeamMemberDto): string {
    const first = m.firstName?.[0] ?? '';
    const last = m.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  levelLabel(level?: string): string {
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

  levelBadgeClass(level?: string): string {
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
}
