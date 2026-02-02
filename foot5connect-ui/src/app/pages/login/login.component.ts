import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DomSanitizer } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { City, Country } from 'country-state-city';
import { AuthenticationRequest, UserDto } from '../../services/models';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';


@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  readonly countries = Country.getAllCountries().sort((a, b) => a.name.localeCompare(b.name));
  cities: Array<{ name: string }> = [];
  authRequest: AuthenticationRequest = {};

  userDto: UserDto = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    city: '',
    country: '',
    username: ''
  };

  errorMessage: Array<string> = [];
  selectedAuthTab: 'login' | 'register' = 'login';
  private selectedCountryIsoCode: string | null = null;

  constructor() {
    this.onAuthTabChange(this.selectedAuthTab);
  }

  onCountrySelected(countryName: string): void {
    const selected = this.countries.find((c) => c.name === countryName) ?? null;
    this.selectedCountryIsoCode = selected?.isoCode ?? null;

    this.userDto.city = '';

    if (!this.selectedCountryIsoCode) {
      this.cities = [];
      return;
    }

    const cities = City.getCitiesOfCountry(this.selectedCountryIsoCode) ?? [];

    this.cities = cities.map((c) => ({ name: c.name })).sort((a, b) => a.name.localeCompare(b.name));
  }

  onAuthTabChange(tab: 'login' | 'register'): void {
    this.selectedAuthTab = tab;

    if (tab === 'login') {
      this.userDto = {
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        city: '',
        country: '',
        username: ''
      };
      this.selectedCountryIsoCode = null;
      this.cities = [];
      this.errorMessage = [];
    } else {
      this.authRequest = {};
      this.errorMessage = [];
      if (this.userDto.country) {
        this.onCountrySelected(this.userDto.country);
      } else {
        this.selectedCountryIsoCode = null;
        this.cities = [];
      }
    }
  }

  onKickOff(): void {
    console.log('[LoginComponent] Kick Off clicked, tab =', this.selectedAuthTab);

    if (this.selectedAuthTab === 'login') {
      this.login();
      return;
    }

    this.register();
  }

  private login(): void {
    this.errorMessage = [];
    this.authService.login(this.authRequest)
    .subscribe({
      next: (res) => {
        localStorage.setItem('token', res.body.token as string);
        const helper = new JwtHelperService();
        const decodedToken = helper.decodeToken(res.body.token as string);
        if (decodedToken.authorities[0].authority === 'ROLE_USER'){
          this.router.navigate(['user/dashboard']);
          console.log(decodedToken);
        }else{
          // this.router.navigate(['admin/dashboard']);
          console.log(decodedToken);
        }
      },
      error: (err) => {
        // err.error correspond au body JSON de ExceptionRepresentation
        const backendError = err.error;
        // message global (par ex. "Object not valid exception has occured")
        if (backendError?.errorMessage) {
          this.errorMessage.push(backendError.errorMessage);
        }
      }
    });
  }

  private register(): void {
    this.errorMessage = [];
    this.authService.register(this.userDto)
      .subscribe({
        next: async (res) => {
          await this.router.navigate(['/confirm-register']);
          console.log(res.body);
        },
        error: (err) => {
          // err.error correspond au body JSON de ExceptionRepresentation
          const backendError = err.error;
          // messages de validation (annotations de UserDto)
          if (backendError?.validationErrors && Array.isArray(backendError.validationErrors)) {
            this.errorMessage.push(...backendError.validationErrors);
          }
        }
      });
  }
}
