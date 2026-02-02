import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiConfiguration } from '../api-configuration';
import { map } from 'rxjs';
import { findById, saveAvailability, setUnavailable } from '../functions';
import { DisponibilityDetailDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);

  findById(userId: number) {
    return findById(this.http, this.apiConfig.rootUrl, { 'id': userId })
      .pipe(map(res => res.body ?? null));
  }

  saveAvailability(userId: number, payload: DisponibilityDetailDto) {
    return saveAvailability(this.http, this.apiConfig.rootUrl, { 'id': userId, 'body': payload })
      .pipe(map(res => res.body ?? null));
  }

  setUnavailable(userId: number) {
    return setUnavailable(this.http, this.apiConfig.rootUrl, { 'id': userId })
      .pipe(map(res => res.body ?? null));
  }
}
