import { Component, inject } from '@angular/core';
 import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { HelperService } from '../../services/helper/helper.service';
import { filter } from 'rxjs/operators';
import { Api } from '../../services/api';
import { findMyTeam } from '../../services/functions';

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

  isTeamMenuOpen = false;

  private currentUrl = '';

  constructor() {
    this.currentUrl = this.router.url;
    this.syncTeamMenuWithUrl();

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

  toggleTeamMenu(): void {
    this.isTeamMenuOpen = !this.isTeamMenuOpen;
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
    }
  }
}
