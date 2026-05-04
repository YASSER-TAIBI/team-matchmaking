import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiConfiguration } from '../api-configuration';
import { map, Observable } from 'rxjs';
import { findAvailablePlayers, findAvailablePlayersInMyLocation, findById, findMe, isAuthenticatedUserInMatch, saveAvailability, setUnavailable } from '../functions';
import { DisponibilityDetailDto } from '../models';
import { AvailablePlayerDto } from '../models/available-player-dto';
import { UserDto } from '../models/user-dto';

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

  findAvailablePlayers(): Observable<AvailablePlayerDto[]> {
    return findAvailablePlayers(this.http, this.apiConfig.rootUrl)
      .pipe(map(res => (res.body ?? []) as AvailablePlayerDto[]));
  }

  findAvailablePlayersInMyLocation(): Observable<AvailablePlayerDto[]> {
    return findAvailablePlayersInMyLocation(this.http, this.apiConfig.rootUrl)
      .pipe(map(res => (res.body ?? []) as AvailablePlayerDto[]));
  }

  findMe(): Observable<UserDto | null> {
    return findMe(this.http, this.apiConfig.rootUrl)
      .pipe(map(res => res.body ?? null));
  }

  isAuthenticatedUserInMatch(): Observable<boolean> {
    return isAuthenticatedUserInMatch(this.http, this.apiConfig.rootUrl)
      .pipe(map(res => res.body ?? false));
  }
}
