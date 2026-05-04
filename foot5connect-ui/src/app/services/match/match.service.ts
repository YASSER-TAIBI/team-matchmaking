import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiConfiguration } from '../api-configuration';
import { map } from 'rxjs';
import { findMyCurrentDualMatchDetails, findMyCurrentMatch } from '../functions';

@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);

  findMyCurrentMatch() {
    return findMyCurrentMatch(this.http, this.apiConfig.rootUrl)
    .pipe(map(res => res.body ?? null));
  }

  findMyCurrentDualMatchDetails() {
    return findMyCurrentDualMatchDetails(this.http, this.apiConfig.rootUrl)
    .pipe(map(res => res.body ?? null));
  }
}
