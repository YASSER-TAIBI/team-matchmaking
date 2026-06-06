import { Component, inject } from '@angular/core';
 import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HelperService } from '../../services/helper/helper.service';
import { filter } from 'rxjs/operators';
import { Api } from '../../services/api';
import { findMyTeam } from '../../services/functions';
import { TeamService } from '../../services/teams/team.service';

@Component({
  selector: 'app-sidenav',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  private helperService = inject(HelperService);
  private router = inject(Router);
  private api = inject(Api);
  private teamService = inject(TeamService);

  isTeamMenuOpen = false;
  isMatchMenuOpen = false;
  hasTeamMembership = false;

  private currentUrl = '';

  constructor() {
    this.currentUrl = this.router.url;
    this.loadTeamMembership();
    this.syncTeamMenuWithUrl();

    this.teamService.teamMembershipChanged$.subscribe(() => {
      this.loadTeamMembership();
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl = (event as NavigationEnd).urlAfterRedirects;
        this.syncTeamMenuWithUrl();
      });
  }

  get isTeamRouteActive(): boolean {
    return this.currentUrl.startsWith('/user/team');
  }

  get isMatchRouteActive(): boolean {
    return this.currentUrl.startsWith('/user/matches/');
  }

  get fullName(): string {
    const value = this.helperService.userFullName ?? '';
    return value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  get initials(): string {
    const value = this.fullName.trim();
    if (!value) {
      return '';
    }

    const parts = value.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return `${first}${last}`.toUpperCase();
  }

  get email(): string {
    return this.helperService.userEmail ?? '';
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  closeTeamMenu(): void {
    this.isTeamMenuOpen = false;
  }

  closeMatchMenu(): void {
    this.isMatchMenuOpen = false;
  }

  toggleTeamMenu(): void {
    this.isTeamMenuOpen = !this.isTeamMenuOpen;
  }

  toggleMatchMenu(): void {
    this.isMatchMenuOpen = !this.isMatchMenuOpen;
  }

  async onCreateTeamNav(): Promise<void> {
    try {
      const team = await this.api.invoke(findMyTeam, {});
      if (team) {
        await this.router.navigate(['/user/team/create']);
      } else {
        await this.router.navigate(['/user/team/conditions']);
      }
    } catch (err: any) {
      console.error(err);
    }
  }

  private syncTeamMenuWithUrl(): void {
    if (this.isTeamRouteActive && !this.currentUrl.startsWith('/user/team/conditions')) {
      this.isTeamMenuOpen = true;
    } else {
      this.isTeamMenuOpen = false;
    }

    if (this.isMatchRouteActive) {
      this.isMatchMenuOpen = true;
    } else {
      this.isMatchMenuOpen = false;
    }
  }

  private loadTeamMembership(): void {
    this.teamService.hasMyTeamMembership().subscribe({
      next: (hasMembership) => {
        this.hasTeamMembership = hasMembership;
      },
      error: (err) => {
        this.hasTeamMembership = false;
        console.error(err);
      }
    });
  }
}
