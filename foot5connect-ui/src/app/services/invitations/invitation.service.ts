import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiConfiguration } from '../api-configuration';
import { CreateTeamInvitationRequest, TeamInvitationDto } from '../models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfiguration);

  createInvitation(payload: CreateTeamInvitationRequest): Observable<TeamInvitationDto> {
    return this.http.post<TeamInvitationDto>(`${this.apiConfig.rootUrl}/team-invitations`, payload)
      .pipe(map(res => res ?? {} as TeamInvitationDto));
  }
 
  findMyInvitations(): Observable<TeamInvitationDto[]> {
    return this.http.get<TeamInvitationDto[]>(`${this.apiConfig.rootUrl}/team-invitations/me`)
      .pipe(map(res => res ?? []));
  }
 
  acceptInvitation(invitationId: number): Observable<TeamInvitationDto> {
    return this.http.put<TeamInvitationDto>(`${this.apiConfig.rootUrl}/team-invitations/${invitationId}/accept`, {})
      .pipe(map(res => res ?? {} as TeamInvitationDto));
  }
 
  rejectInvitation(invitationId: number): Observable<TeamInvitationDto> {
    return this.http.put<TeamInvitationDto>(`${this.apiConfig.rootUrl}/team-invitations/${invitationId}/rejet`, {})
      .pipe(map(res => res ?? {} as TeamInvitationDto));
  }
}
