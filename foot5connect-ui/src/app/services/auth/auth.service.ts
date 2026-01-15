import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfiguration } from '../api-configuration';
import { login, register, requestPasswordReset, resetPassword, validatePasswordResetToken } from '../functions';
import { AuthenticationRequest } from '../models/authentication-request';
import { AuthenticationResponse } from '../models/authentication-response';
import { TokenValidationResponse } from '../models/token-validation-response';
import { UserDto } from '../models/user-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);

  login(body: AuthenticationRequest) {
    return login(this.http, this.apiConfig.rootUrl, { body });
  }

  register(body: UserDto) {
    return register(this.http, this.apiConfig.rootUrl, { body });
  }

  requestPasswordReset(body: { email: string }): Observable<HttpResponse<AuthenticationResponse>> {
    return requestPasswordReset(this.http, this.apiConfig.rootUrl, { body });
  }

  validatePasswordResetToken(token: string): Observable<HttpResponse<TokenValidationResponse>> {
    return validatePasswordResetToken(this.http, this.apiConfig.rootUrl, { token });
  }

  resetPassword(body: { token: string; password: string; confirmPassword: string }): Observable<HttpResponse<AuthenticationResponse>> {
    return resetPassword(this.http, this.apiConfig.rootUrl, { body });
  }

  // requestPasswordReset(body: { email: string }): Observable<HttpResponse<AuthenticationResponse>> {
  //   return this.http.post<AuthenticationResponse>(
  //     `${this.apiConfig.rootUrl}/auth/password-reset/request`,
  //     body,
  //     { observe: 'response' }
  //   );
  // }

  // validatePasswordResetToken(token: string): Observable<HttpResponse<string>> {
  //   return this.http.get(
  //     `${this.apiConfig.rootUrl}/auth/password-reset/validate`,
  //     { params: { token }, observe: 'response', responseType: 'text' }
  //   );
  // }

  // resetPassword(body: { token: string; password: string; confirmPassword: string }): Observable<HttpResponse<AuthenticationResponse>> {
  //   return this.http.post<AuthenticationResponse>(
  //     `${this.apiConfig.rootUrl}/auth/password-reset/reset`,
  //     body,
  //     { observe: 'response' }
  //   );
  // }
}
