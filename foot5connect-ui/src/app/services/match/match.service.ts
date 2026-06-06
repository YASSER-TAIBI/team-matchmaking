import { HttpClient } from '@angular/common/http';

import { inject, Injectable } from '@angular/core';

import { ApiConfiguration } from '../api-configuration';

import { map } from 'rxjs';

import { confirmCurrentDualMatchCancellation, findMyCurrentDualMatchDetails, findMyCurrentMatch } from '../functions';
import { FinishCurrentDualMatchRequest } from '../models';


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

  confirmCurrentDualMatchCancellation(confirmed: boolean) {

    return confirmCurrentDualMatchCancellation(this.http, this.apiConfig.rootUrl, { confirmed })

    .pipe(map(res => res.body ?? null));

  }

  finishCurrentDualMatch(request: FinishCurrentDualMatchRequest) {

    return this.http.put<void>(`${this.apiConfig.rootUrl}/matches/me/current-dual-match/finish`, request);

  }

}

