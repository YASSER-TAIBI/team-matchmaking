import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HelperService } from '../../services/helper/helper.service';

@Component({
  selector: 'app-sidenav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  private helperService = inject(HelperService);

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
}
