import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  private jwtHelper: JwtHelperService = new JwtHelperService();
  private decodedToken: any;

  constructor() {
    this.refreshDecodedToken();
   }

  private refreshDecodedToken(): void {
    const token = localStorage.getItem('token');
    this.decodedToken = token ? this.jwtHelper.decodeToken(token) : null;
  }

   get userId(): number | null {
  this.refreshDecodedToken();
  return this.decodedToken?.userId ?? null;
 }

 get userFullName(): string | null {
  this.refreshDecodedToken();
  return this.decodedToken?.fullName ?? null;
 }
 
 get userEmail(): string | null {
  this.refreshDecodedToken();
  return this.decodedToken?.sub ?? null;
 }

 get userCountry(): string | null {
  this.refreshDecodedToken();
  return this.decodedToken?.country ?? null;
 }

 get userCity(): string | null {
  this.refreshDecodedToken();
  return this.decodedToken?.city ?? null;
 }
}
