import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { HelperService } from '../../services/helper/helper.service';
import { NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit, OnDestroy {
private helperService = inject(HelperService);
private router = inject(Router);

  private routerSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileDrawer();
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.routerSubscription = null;
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
    this.closeMobileDrawer();
    this.router.navigate(['/login']);
  }

  private closeMobileDrawer(): void {
    const el = document.getElementById('mobile-nav-toggle') as HTMLInputElement | null;
    if (el) {
      el.checked = false;
    }
  }
}
