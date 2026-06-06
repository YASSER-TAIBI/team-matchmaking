import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiConfiguration } from '../api-configuration';
import { createTeam, findCompleteTeamsInMyCity, findMyMemberTeam, hasMyTeamMembership } from '../functions';
import { findMyTeam } from '../functions';
import { rejoinMyTeam } from '../fn/team-controller/rejoin-my-team';
import { leaveMyTeam } from '../fn/team-controller/leave-my-team';
import { removeMemberFromMyTeam } from '../fn/team-controller/remove-member-from-my-team';
import { updateTeam } from '../fn/team-controller/update-team';
import { map } from 'rxjs';
import { TeamDto } from '../models/team-dto';

export interface CurrentMatchDto {
  matchId?: number;
  matchDate?: string;
  startTime?: string;
  location?: string;
  myTeamId?: number;
  myTeamName?: string;
  opponentTeamId?: number;
  opponentTeamName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);
  private teamMembershipChangedSubject = new Subject<void>();

  teamMembershipChanged$ = this.teamMembershipChangedSubject.asObservable();

  notifyTeamMembershipChanged(): void {
    this.teamMembershipChangedSubject.next();
  }

  createTeam() {
    return createTeam(this.http, this.apiConfig.rootUrl)
      .pipe(map(res => res.body ?? null));
  }

  findMyTeam() {
    return findMyTeam(this.http, this.apiConfig.rootUrl)
      .pipe(map(res => (res.body as TeamDto) ?? null));
  }

  findMyMemberTeam() {
    return findMyMemberTeam(this.http, this.apiConfig.rootUrl)
      .pipe(map(res => (res.body as TeamDto) ?? null));
  }


  findCompleteTeamsInMyCity(): Observable<TeamDto[]> {
    return findCompleteTeamsInMyCity(this.http, this.apiConfig.rootUrl)
      .pipe(map(res => (res.body ?? []) as TeamDto[]));
  }

  hasMyTeamMembership() {
    return hasMyTeamMembership(this.http, this.apiConfig.rootUrl)
      .pipe(map(res => res.body ?? false));
  }

  updateTeam(data: Partial<TeamDto>): Observable<TeamDto> {
    return updateTeam(this.http, this.apiConfig.rootUrl, { body: data as TeamDto })
      .pipe(map(res => res.body ?? ({} as TeamDto)));
  }

  leaveMyTeam(): Observable<void> {
    return leaveMyTeam(this.http, this.apiConfig.rootUrl)
      .pipe(map(() => void 0));
  }

  rejoinMyTeam(): Observable<void> {
    return rejoinMyTeam(this.http, this.apiConfig.rootUrl)
      .pipe(map(() => void 0));
  }

  removeMemberFromMyTeam(userId: number): Observable<void> {
    return removeMemberFromMyTeam(this.http, this.apiConfig.rootUrl, { userId })
      .pipe(map(() => void 0));
  }
}
