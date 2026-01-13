import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration } from '../api-configuration';
import { login, register } from '../functions';
import { AuthenticationRequest } from '../models/authentication-request';
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
}
