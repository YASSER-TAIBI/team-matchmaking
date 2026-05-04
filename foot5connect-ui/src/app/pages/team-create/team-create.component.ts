import { CommonModule, DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TeamInvitationDto } from '../../services/models/team-invitation-dto';
import { InvitationService } from '../../services/invitations/invitation.service';
import { TeamService } from '../../services/teams/team.service';
import { TeamDto } from '../../services/models/team-dto';
import { TeamMemberDto } from '../../services/models/team-member-dto';
import { UserDto } from '../../services/models/user-dto';
import { UserService } from '../../services/users/user.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

type TeamCreateTab = 'creation' | 'formation' | 'disponibilite' | 'invitation' | 'historique';
type TeamEditSection = 'identity' | 'formation';
type AvailabilityLevel = 'DÉBUTANT' | 'AVANCÉ' | 'AMATEUR';
type TeamLevelValue = NonNullable<TeamDto['teamLevel']>;
type PlayerPositionOption = NonNullable<TeamMemberDto['position']>;
type PlayerSelectionOption = NonNullable<TeamMemberDto['selection']>;
type PitchSlot = {
  key: string;
  cssClass: string;
  member?: TeamMemberDto;
};

declare global {
  interface Window {
    google?: any;
    initializeGoogleMapsPlaces?: () => void;
  }
}

@Component({
  selector: 'app-team-create',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatNativeDateModule, MatInputModule, ConfirmDialogComponent],
  templateUrl: './team-create.component.html',
  styleUrl: './team-create.component.scss'
})
export class TeamCreateComponent implements OnInit, AfterViewInit {
  private invitationService = inject(InvitationService);
  private teamService = inject(TeamService);
  private userService = inject(UserService);
  private sanitizer = inject(DomSanitizer);
  private document = inject(DOCUMENT);
  private ngZone = inject(NgZone);

  private availabilityPlacesLibrary?: any;
  private availabilityAutocompleteElement?: any;
  private availabilityAutocompleteHost?: ElementRef<HTMLElement>;

  @ViewChild('availabilityAutocompleteHost')
  set availabilityAutocompleteHostRef(value: ElementRef<HTMLElement> | undefined) {
    this.availabilityAutocompleteHost = value;
    if (value) {
      void this.initializeAvailabilityAutocomplete();
    }
  }

  private availabilityAutocompleteInitialized = false;

  activeTab: TeamCreateTab = 'creation';
  team: TeamDto | null = null;
  members: TeamMemberDto[] = [];
  currentUserId: number | null = null;
  invitations: TeamInvitationDto[] = [];
  filteredInvitations: TeamInvitationDto[] = [];
  invitationsLoading = false;
  invitationsError: string | null = null;
  selectedInvitationLevel: TeamInvitationDto['invitedUserLevel'] | null = null;
  selectedInvitationStatus: TeamInvitationDto['status'] | null = null;
  selectedInvitationDate: Date | null = null;
  availabilityLevelValue = 50;

  isEditingIdentity = false;
  isEditingFormation = false;
  editName = '';
  editLogoUrl = '';
  editAvailableDate = '';
  editStartTime = '';
  editEndTime = '';
  editMembers: TeamMemberDto[] = [];
  showConfirmDialog = false;
  showFormationValidationDialog = false;
  showIdentityScheduleDialog = false;
  showAvailabilityConfirmDialog = false;
  confirmEditSection: TeamEditSection = 'identity';
  showLeaveTeamDialog = false;
  showRemoveMemberDialog = false;
  hasLeftTeam = false;
  teamActionPending = false;
  teamActionDialogMessage = "";
  teamActionDialogDetails: string[] = [];
  teamActionDialogIcon = '';
  memberActionPending = false;
  memberToRemove: TeamMemberDto | null = null;
  formationValidationMessage = '';
  formationValidationDetails: string[] = [];
  availabilityAddressQuery = '';
  availabilityFieldName = 'Terrain à confirmer';
  availabilityFieldAddress = 'Non renseignée';
  availabilityFieldPricing: NonNullable<TeamDto['tarificationTerrain']> = 'PAYANT';
  availabilityPricePerPerson = 9;
  availabilitySelectedPlaceId = '';
  availabilitySelectedLatitude: number | null = null;
  availabilitySelectedLongitude: number | null = null;

  readonly positionOptions: Array<{ value: PlayerPositionOption; label: string }> = [
    { value: 'GOALKEEPER', label: 'Gardien' },
    { value: 'DEFENDER', label: 'Défenseur' },
    { value: 'MIDFIELDER', label: 'Milieu' },
    { value: 'ATTACKER', label: 'Attaquant' }
  ];

  readonly selectionOptions: Array<{ value: PlayerSelectionOption; label: string }> = [
    { value: 'STARTER', label: 'Titulaire' },
    { value: 'SUBSTITUTE', label: 'Remplaçant' }
  ];

  readonly availabilityLevels: Array<{ label: AvailabilityLevel; value: number }> = [
    { label: 'DÉBUTANT', value: 0 },
    { label: 'AMATEUR', value: 50 },
    { label: 'AVANCÉ', value: 100 }
  ];

  ngOnInit(): void {
    this.loadCurrentUserContext();

    this.teamService.findMyTeam().subscribe({
      next: (data) => {
        this.team = data;
        this.members = data?.members ?? [];
        this.syncAvailabilityDetailsFromTeam();
        this.syncAvailabilityLevelFromTeam();
        this.syncFormationEditMembers();
        this.hasLeftTeam = this.members.length === 0;
      },
      error: (err) => console.error('Erreur chargement équipe', err)
    });

    this.loadMemberInvitations();
  }

  private loadCurrentUserContext(): void {
    this.userService.findMe().subscribe({
      next: (user: UserDto | null) => {
        this.currentUserId = user?.id ?? null;
        this.initializeAvailabilityLocationFromUser(user);
      },
      error: (err) => {
        console.error('Erreur chargement utilisateur courant', err);
        this.currentUserId = null;
        this.initializeAvailabilityLocationFromUser(null);
      }
    });
  }

  ngAfterViewInit(): void {
    void this.initializeAvailabilityAutocomplete();
  }

  loadMemberInvitations(): void {
    this.invitationsLoading = true;
    this.invitationsError = null;

    this.invitationService.findMemberInvitations().subscribe({
      next: (invitations) => {
        this.invitations = invitations;
        this.applyInvitationFilters();
        this.invitationsLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement invitations équipe', err);
        this.invitations = [];
        this.filteredInvitations = [];
        this.invitationsError = 'Impossible de charger les joueurs invités.';
        this.invitationsLoading = false;
      }
    });
  }

  get visibleInvitations(): TeamInvitationDto[] {
    return this.filteredInvitations.slice(0, 4);
  }

  get hasMoreThanFourInvitations(): boolean {
    return this.filteredInvitations.length > 4;
  }

  onInvitationLevelChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value ?? '';
    this.selectedInvitationLevel = value ? (value as TeamInvitationDto['invitedUserLevel']) : null;
  }

  onInvitationStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value ?? '';
    this.selectedInvitationStatus = value ? (value as TeamInvitationDto['status']) : null;
  }

  onInvitationDateSelected(date: Date | null): void {
    this.selectedInvitationDate = date;
  }

  onInvitationDateInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    if (!value) {
      this.selectedInvitationDate = null;
    }
  }

  onAvailabilityLevelInput(event: Event): void {
    if (this.isTeamConfirmed) {
      return;
    }

    const value = Number((event.target as HTMLInputElement | null)?.value ?? this.availabilityLevelValue);
    this.availabilityLevelValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 50;
  }

  get availabilityLevelLabel(): AvailabilityLevel {
    if (this.availabilityLevelValue <= 25) {
      return 'DÉBUTANT';
    }

    if (this.availabilityLevelValue >= 75) {
      return 'AVANCÉ';
    }

    return 'AMATEUR';
  }

  get availabilityLevelFillPercent(): string {
    return `${this.availabilityLevelValue}%`;
  }

  isAvailabilityLevelActive(level: AvailabilityLevel): boolean {
    return this.availabilityLevelLabel === level;
  }

  get selectedTeamLevelValue(): TeamLevelValue {
    switch (this.availabilityLevelLabel) {
      case 'DÉBUTANT':
        return 'DEBUTANT';
      case 'AVANCÉ':
        return 'AVANCE';
      default:
        return 'AMATEUR';
    }
  }

  get availabilityMatchDateLabel(): string {
    const value = this.team?.availableDate;
    if (!value) {
      return 'Non renseignée';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short'
    });
  }

  get availabilityMatchTimeRangeLabel(): string {
    if (!this.team?.startTime || !this.team?.endTime) {
      return 'Non renseigné';
    }

    return `${this.formatInputTime(this.team.startTime)} - ${this.formatInputTime(this.team.endTime)}`;
  }

  get availabilityMapUrl(): SafeResourceUrl {
    if (this.availabilitySelectedPlaceId) {
      const placeId = encodeURIComponent(this.availabilitySelectedPlaceId);
      return this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.googleMaps.embedPlaceBaseUrl}?key=${environment.googleMaps.apiKey}&q=place_id:${placeId}`);
    }

    if (this.availabilitySelectedLatitude !== null && this.availabilitySelectedLongitude !== null) {
      const coordinates = encodeURIComponent(`${this.availabilitySelectedLatitude},${this.availabilitySelectedLongitude}`);
      return this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.googleMaps.embedPlaceBaseUrl}?key=${environment.googleMaps.apiKey}&q=${coordinates}`);
    }

    const query = encodeURIComponent(this.availabilityFieldAddress || this.availabilityAddressQuery || this.availabilityFieldName);
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.googleMaps.embedSearchBaseUrl}?q=${query}&z=15&output=embed`);
  }

  get availabilityTotalTeamCost(): number {
    if (this.availabilityFieldPricing === 'GRATUIT') {
      return 0;
    }

    const value = Number(this.availabilityPricePerPerson);
    const normalizedValue = Number.isFinite(value) ? Math.max(0, value) : 0;
    return normalizedValue * 5;
  }

  get availabilityTotalTeamCostLabel(): string {
    return `${this.availabilityTotalTeamCost.toFixed(2)} €`;
  }

  get availableStarterCount(): number {
    return this.members.filter(member => member.selection === 'STARTER').length;
  }

  get availabilityProgressPercent(): number {
    return Math.max(0, Math.min(100, (this.availableStarterCount / 5) * 100));
  }

  get availabilityProgressOffset(): number {
    const circumference = 2 * Math.PI * 70;
    return circumference - (circumference * this.availabilityProgressPercent) / 100;
  }

  get remainingStarterPlaces(): number {
    return Math.max(0, 5 - this.availableStarterCount);
  }

  get canConfirmTeamAvailability(): boolean {
    return this.availableStarterCount === 5;
  }

  get isAvailabilityConfirmationLocked(): boolean {
    return this.isTeamConfirmed;
  }

  get isAvailabilityLevelLocked(): boolean {
    return this.isTeamConfirmed;
  }

  get isTeamConfirmed(): boolean {
    return this.team?.status === 'COMPLETE' || this.team?.status === 'IN_MATCH';
  }

  get availabilityAlertMessage(): string {
    if (this.canConfirmTeamAvailability) {
      return 'Votre équipe dispose maintenant de 5 titulaires. Vous pouvez confirmer votre équipe pour le match.';
    }

    return `Vous avez besoin d’au moins 5 joueurs titulaires pour valider votre équipe. Il vous reste ${this.remainingStarterPlaces} place${this.remainingStarterPlaces > 1 ? 's' : ''} à compléter.`;
  }

  get confirmedAvailabilityAvatars(): string[] {
    return this.members
      .filter(member => member.selection === 'STARTER')
      .slice(0, 5)
      .map(member => this.getMemberInitials(member));
  }

  get availabilityRemainingPlacesLabel(): string {
    if (this.remainingStarterPlaces <= 0) {
      return 'Aucune place restante';
    }

    return `${this.remainingStarterPlaces} place${this.remainingStarterPlaces > 1 ? 's' : ''} restante${this.remainingStarterPlaces > 1 ? 's' : ''}`;
  }

  confirmTeamAvailability(): void {
    if (!this.canConfirmTeamAvailability || this.isTeamConfirmed) {
      return;
    }

    if (!this.team?.availableDate ||
       !this.team?.startTime ||
        !this.team?.endTime ||
         !this.availabilitySelectedPlaceId ||
          !this.availabilityFieldPricing ||
            (this.availabilityFieldPricing === 'PAYANT' && !this.availabilityPricePerPerson)) {
      this.showIdentityScheduleDialog = true;
      return;
    }

    this.showAvailabilityConfirmDialog = true;
  }

  confirmAvailabilityConfirmation(): void {
    this.showAvailabilityConfirmDialog = false;

    const team = this.team;
    if (!team) {
      return;
    }

    this.teamService.updateTeam({
      availableDate: team.availableDate,
      startTime: team.startTime,
      endTime: team.endTime,
      status: 'COMPLETE',
      teamLevel: this.selectedTeamLevelValue,
      formation: this.formationTitle,
      tarificationTerrain: this.availabilityFieldPricing,
      prix: this.availabilityFieldPricing === 'PAYANT' ? this.availabilityPricePerPerson : undefined,
      pitchAddress: this.availabilitySelectedPlaceId,
      titleAddress: this.availabilityFieldName
    }).subscribe({
      next: (updated: TeamDto) => {
        this.team = updated;
        this.members = updated?.members ?? this.members;
        this.syncAvailabilityDetailsFromTeam();
        this.availabilityAddressQuery = '';
        this.clearAvailabilityAutocompleteSearch();
        this.syncAvailabilityLevelFromTeam();
      },
      error: (err: any) => console.error('Erreur lors de la confirmation de l’équipe', err)
    });
  }

  cancelAvailabilityConfirmation(): void {
    this.showAvailabilityConfirmDialog = false;
  }

  applyInvitationFilters(): void {
    const selectedDate = this.selectedInvitationDate;
    const selectedDateOnly = selectedDate
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      : null;

    this.filteredInvitations = this.invitations.filter(invitation => {
      if (this.selectedInvitationLevel && invitation.invitedUserLevel !== this.selectedInvitationLevel) {
        return false;
      }

      if (this.selectedInvitationStatus && invitation.status !== this.selectedInvitationStatus) {
        return false;
      }

      if (selectedDateOnly) {
        const invitationDateOnly = (invitation.availableDate ?? '').slice(0, 10);
        if (invitationDateOnly !== selectedDateOnly) {
          return false;
        }
      }

      return true;
    });
  }

  goToInvitations(): void {
    this.activeTab = 'invitation';
  }

  // async confirmAvailabilityField(): Promise<void> {
  //   const normalizedQuery = this.availabilityAddressQuery.trim();

  //   if (normalizedQuery) {
  //     if (!this.availabilitySelectedPlaceId) {
  //       this.availabilityFieldAddress = normalizedQuery;
  //       this.availabilityFieldName = normalizedQuery;
  //     }
  //   }

  //   console.log('Terrain confirmé', {
  //     fieldName: this.availabilityFieldName,
  //     address: this.availabilityFieldAddress,
  //     placeId: this.availabilitySelectedPlaceId || null,
  //     latitude: this.availabilitySelectedLatitude,
  //     longitude: this.availabilitySelectedLongitude,
  //     pricing: this.availabilityFieldPricing,
  //     pricePerPerson: this.availabilityFieldPricing === 'PAYANT' ? this.availabilityPricePerPerson : null,
  //     totalTeamCost: this.availabilityFieldPricing === 'PAYANT' ? this.availabilityTotalTeamCost : null
  //   });
  // }

  onAvailabilityAddressInputChange(): void {
    this.availabilitySelectedPlaceId = '';
    this.availabilitySelectedLatitude = null;
    this.availabilitySelectedLongitude = null;
  }

  setAvailabilityFieldPricing(pricing: NonNullable<TeamDto['tarificationTerrain']>): void {
    this.availabilityFieldPricing = pricing;
    if (pricing === 'GRATUIT') {
      this.availabilityPricePerPerson = 0;
    } else {
      this.availabilityPricePerPerson = 9;
    }
  }

  private initializeAvailabilityLocationFromUser(user: UserDto | null): void {
    const userCity = user?.city?.trim();

    if (!userCity) {
      this.availabilityAddressQuery = '';
      this.availabilityFieldAddress = 'Non renseignée';
      this.availabilityFieldName = 'Terrain à confirmer';
      return;
    }

    this.availabilityAddressQuery = userCity;
    this.availabilityFieldAddress = userCity;
    this.availabilityFieldName = `${userCity}`;
  }

  private syncAvailabilityDetailsFromTeam(): void {
    if (!this.team) {
      this.updateAvailabilityAutocompleteInteractivity();
      return;
    }

    if (this.team.titleAddress) {
      this.availabilityFieldName = this.team.titleAddress;
      this.availabilityFieldAddress = this.team.titleAddress;
    }

    if (this.team.pitchAddress) {
      this.availabilitySelectedPlaceId = this.team.pitchAddress;
    }

    if (this.team.tarificationTerrain) {
      this.availabilityFieldPricing = this.team.tarificationTerrain;
    }

    if (this.team.tarificationTerrain === 'PAYANT') {
      this.availabilityPricePerPerson = this.team.prix ?? this.availabilityPricePerPerson;
    } else if (this.team.tarificationTerrain === 'GRATUIT') {
      this.availabilityPricePerPerson = 0;
    }

    this.updateAvailabilityAutocompleteInteractivity();
  }

  private updateAvailabilityAutocompleteInteractivity(): void {
    const host = this.availabilityAutocompleteHost?.nativeElement;
    if (host) {
      host.style.pointerEvents = this.isTeamConfirmed ? 'none' : 'auto';
      host.style.opacity = this.isTeamConfirmed ? '0.7' : '1';
      host.setAttribute('aria-disabled', this.isTeamConfirmed ? 'true' : 'false');
    }

    if (!this.availabilityAutocompleteElement) {
      return;
    }

    const autocompleteElement = this.availabilityAutocompleteElement as HTMLElement & { disabled?: boolean };
    if ('disabled' in autocompleteElement) {
      autocompleteElement.disabled = this.isTeamConfirmed;
    }

    if (this.isTeamConfirmed) {
      autocompleteElement.setAttribute('tabindex', '-1');
      autocompleteElement.setAttribute('aria-disabled', 'true');
      return;
    }

    autocompleteElement.removeAttribute('tabindex');
    autocompleteElement.setAttribute('aria-disabled', 'false');
  }

  private clearAvailabilityAutocompleteSearch(): void {
    if (!this.availabilityAutocompleteElement) {
      return;
    }

    const autocompleteElement = this.availabilityAutocompleteElement as any;
    autocompleteElement.value = '';

    const internalInput = autocompleteElement.querySelector?.('input') as HTMLInputElement | null;
    if (internalInput) {
      internalInput.value = '';
    }

    const shadowInput = autocompleteElement.shadowRoot?.querySelector?.('input') as HTMLInputElement | null;
    if (shadowInput) {
      shadowInput.value = '';
    }
  }

  private async initializeAvailabilityAutocomplete(): Promise<void> {
    if (!this.availabilityAutocompleteHost?.nativeElement) {
      return;
    }

    const host = this.availabilityAutocompleteHost.nativeElement;

    if (this.availabilityAutocompleteInitialized && this.availabilityAutocompleteElement) {
      host.innerHTML = '';
      host.appendChild(this.availabilityAutocompleteElement);
      this.updateAvailabilityAutocompleteInteractivity();
      return;
    }

    try {
      await this.loadGoogleMapsPlacesScript();
    } catch (error) {
      console.error('Erreur initialisation Google Places', error);
      return;
    }

    if (!window.google?.maps || !this.availabilityAutocompleteHost?.nativeElement) {
      return;
    }

    this.availabilityPlacesLibrary = await window.google.maps.importLibrary('places');

    this.availabilityAutocompleteElement = new this.availabilityPlacesLibrary.PlaceAutocompleteElement({
      includedPrimaryTypes: ['establishment', 'geocode']
    });

    this.availabilityAutocompleteElement.setAttribute('aria-label', 'Rechercher une adresse de terrain');
    this.availabilityAutocompleteElement.setAttribute('placeholder', 'Rechercher un terrain...');
    this.availabilityAutocompleteElement.classList.add('availability-map-card__autocomplete-element');
    this.applyAvailabilityAutocompleteElementStyles();

    host.innerHTML = '';
    host.appendChild(this.availabilityAutocompleteElement);
    this.updateAvailabilityAutocompleteInteractivity();

    this.availabilityAutocompleteElement.addEventListener('gmp-select', async (event: any) => {
      const placePrediction = event?.placePrediction;
      if (!placePrediction) {
        return;
      }

      const place = placePrediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'id'] });

      this.ngZone.run(() => {
        this.applyAvailabilityPlaceSelection(place);
      });
    });

    this.availabilityAutocompleteInitialized = true;
  }

  private applyAvailabilityAutocompleteElementStyles(): void {
    if (!this.availabilityAutocompleteElement) {
      return;
    }

    const style = this.availabilityAutocompleteElement.style;
    style.display = 'block';
    style.width = '100%';
    style.minHeight = '52px';
    style.boxSizing = 'border-box';
    style.borderRadius = '16px';
    style.border = '1px solid rgba(255, 255, 255, 0.08)';
    style.backgroundColor = 'rgba(11, 20, 14, 0.85)';
    style.color = '#f4fdf8';
    style.fontFamily = 'inherit';
    style.fontSize = '14px';
    style.lineHeight = '1.2';
  }

  private applyAvailabilityPlaceSelection(place: any): void {
    this.availabilityFieldName = place.displayName || place.name || this.availabilityAddressQuery;
    this.availabilityFieldAddress = place.formattedAddress || place.formatted_address || place.displayName || place.name || this.availabilityAddressQuery;
    this.availabilityAddressQuery = this.availabilityFieldAddress;
    this.availabilitySelectedPlaceId = place.id || place.place_id || '';
    this.availabilitySelectedLatitude = place.location?.lat ? place.location.lat() : (place.geometry?.location?.lat ? place.geometry.location.lat() : null);
    this.availabilitySelectedLongitude = place.location?.lng ? place.location.lng() : (place.geometry?.location?.lng ? place.geometry.location.lng() : null);
  }

  private loadGoogleMapsPlacesScript(): Promise<void> {
    if (window.google?.maps?.places) {
      return Promise.resolve();
    }

    if (!environment.googleMaps.apiKey) {
      return Promise.reject(new Error('Google Maps API key is missing in environment.googleMaps.apiKey'));
    }

    const existingScript = this.document.getElementById('google-maps-places-script') as HTMLScriptElement | null;
    if (existingScript) {
      return new Promise((resolve, reject) => {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Impossible de charger Google Maps Places.')), { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = this.document.createElement('script');
      script.id = 'google-maps-places-script';
      script.async = true;
      script.defer = true;
      window.initializeGoogleMapsPlaces = () => {
        resolve();
        delete window.initializeGoogleMapsPlaces;
      };
      script.src = `${environment.googleMaps.scriptBaseUrl}?key=${environment.googleMaps.apiKey}&libraries=places&v=weekly&loading=async&callback=initializeGoogleMapsPlaces`;
      script.onload = () => {
        if (window.google?.maps?.places) {
          resolve();
          delete window.initializeGoogleMapsPlaces;
        }
      };
      script.onerror = () => reject(new Error('Impossible de charger Google Maps Places.'));
      this.document.body.appendChild(script);
    });
  }

  startEditIdentity(): void {
    this.editName = this.team?.name ?? '';
    this.editLogoUrl = this.team?.logoUrl ?? '';
    this.editAvailableDate = (this.team?.availableDate ?? '').slice(0, 10);
    this.editStartTime = this.formatInputTime(this.team?.startTime);
    this.editEndTime = this.formatInputTime(this.team?.endTime);
    this.isEditingIdentity = true;
  }

  cancelEditIdentity(): void {
    this.isEditingIdentity = false;
  }

  saveIdentity(): void {
    if (!this.editAvailableDate || !this.editStartTime || !this.editEndTime) {
      this.showIdentityScheduleDialog = true;
      return;
    }

    this.confirmEditSection = 'identity';
    this.showConfirmDialog = true;
  }

  closeIdentityScheduleDialog(): void {
    this.showIdentityScheduleDialog = false;
  }

  startEditFormation(): void {
    this.syncFormationEditMembers();
    this.isEditingFormation = true;
  }

  cancelEditFormation(): void {
    this.syncFormationEditMembers();
    this.isEditingFormation = false;
  }

  saveFormation(): void {
    const validationErrors = this.validateFormation();

    if (validationErrors.length > 0) {
      this.formationValidationMessage = 'La composition de votre équipe n’est pas valide. Corrigez les éléments suivants avant de confirmer :';
      this.formationValidationDetails = validationErrors;
      this.showFormationValidationDialog = true;
      return;
    }

    this.confirmEditSection = 'formation';
    this.showConfirmDialog = true;
  }

  onTeamActionClick(): void {
    if (this.hasLeftTeam) {
      this.teamActionDialogMessage = "Êtes-vous sûr de vouloir rejoindre votre équipe à nouveau ? \n Si vous confirmez, vous réintégrerez immédiatement votre équipe avec les effets suivants :";
      this.teamActionDialogDetails = [
        "Votre profil sera ajouté directement à la liste de sélection comme capitaine de l'équipe.",
        "Votre statut repassera à en équipe."
      ];
      this.teamActionDialogIcon = 'login';
      this.showLeaveTeamDialog = true;
      return;
    }

    this.teamActionDialogMessage = "Êtes-vous sûr de vouloir quitter l'équipe pour le moment ? \n Si vous confirmez, cette action aura les conséquences suivantes :";
    this.teamActionDialogDetails = [
      "Tous les membres de l'équipe seront retirés de la liste de sélection.",
      "Le statut de chaque membre passera à Indisponible.",
      "Toutes les invitations de cette équipe encore En Attente seront passées à Annulée."
    ];
    this.teamActionDialogIcon = 'logout';
    this.showLeaveTeamDialog = true;
  }

  confirmLeaveTeam(): void {
    if (this.teamActionPending) {
      return;
    }

    if (this.hasLeftTeam) {
      this.teamActionPending = true;
      if (this.currentUserId == null) {
        this.showBlockedRejoinMessage("Impossible de vérifier votre profil pour le moment.");
        this.teamActionPending = false;
        return;
      }

      forkJoin({
        hasMembership: this.teamService.hasMyTeamMembership(),
        currentUser: this.userService.findMe()
      }).subscribe({
        next: ({ hasMembership, currentUser }) => {
          const isCurrentCaptainInDisplayedTeam = this.members.some(member => this.isCurrentMember(member));
          const isAlreadyInAnotherTeam = !!hasMembership && !isCurrentCaptainInDisplayedTeam;
          const isMarkedInTeam = currentUser?.availabilityStatus === 'EN_EQUIPE';

          if (isAlreadyInAnotherTeam || isMarkedInTeam) {
            this.showBlockedRejoinMessage("Tu ne peux pas rejoindre l'équipe en ce moment parce que ton profil est déjà rattaché à une autre équipe.");
            this.teamActionPending = false;
            return;
          }

          this.teamService.rejoinMyTeam().subscribe({
            next: () => {
              this.teamService.findMyMemberTeam().subscribe({
                next: (data) => {
                  this.team = data;
                  this.members = data?.members ?? [];
                  this.syncAvailabilityLevelFromTeam();
                  this.hasLeftTeam = this.members.length === 0;
                  this.showLeaveTeamDialog = false;
                  this.loadMemberInvitations();
                  this.teamActionPending = false;
                },
                error: (err: any) => {
                  console.error("Erreur lors du rechargement de l'équipe", err);
                  this.teamActionPending = false;
                }
              });
            },
            error: (err: any) => {
              console.error("Erreur lors de la réintégration de l'équipe", err);
              this.teamActionPending = false;
            }
          });
        },
        error: (err: any) => {
          console.error("Erreur lors de la vérification avant réintégration", err);
          this.teamActionPending = false;
        }
      });
      return;
    }

    this.teamActionPending = true;
    this.teamService.leaveMyTeam().subscribe({
      next: () => {
        this.showLeaveTeamDialog = false;
        this.hasLeftTeam = true;
        this.team = null;
        this.members = [];
        this.loadMemberInvitations();
        this.teamActionPending = false;
      },
      error: (err: any) => {
        console.error("Erreur lors de la sortie de l'équipe", err);
        this.teamActionPending = false;
      }
    });
  }

  cancelLeaveTeam(): void {
    if (this.teamActionPending) {
      return;
    }

    this.showLeaveTeamDialog = false;
  }

  private showBlockedRejoinMessage(message: string): void {
    this.showLeaveTeamDialog = false;
    this.document.defaultView?.alert(message);
  }

  get teamActionLabel(): string {
    return this.hasLeftTeam ? "Rejoindre l'Équipe" : "Quitter l'Équipe";
  }

  get teamActionIcon(): string {
    return this.hasLeftTeam ? 'login' : 'logout';
  }

  confirmSave(): void {
    this.showConfirmDialog = false;
    if (!this.team) return;

    if (this.confirmEditSection === 'formation') {
      const formationMembersPayload: TeamMemberDto[] = this.editMembers.map(member => ({
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        jerseyNumber: member.jerseyNumber,
        position: member.position,
        selection: member.selection
      }));

      this.teamService.updateTeam({ members: formationMembersPayload }).subscribe({
        next: (updated: TeamDto) => {
          this.team = updated;
          this.members = updated?.members ?? [];
          this.syncFormationEditMembers();
          this.isEditingFormation = false;
        },
        error: (err: any) => console.error('Erreur lors de la mise à jour de la formation', err)
      });
      return;
    }

    this.teamService.updateTeam({
      name: this.editName,
      logoUrl: this.editLogoUrl,
      availableDate: this.editAvailableDate,
      startTime: `${this.editStartTime}:00`,
      endTime: `${this.editEndTime}:00`,
      teamLevel: this.selectedTeamLevelValue
    }).subscribe({
      next: (updated: TeamDto) => {
        this.team = updated;
        this.members = updated?.members ?? this.members;
        this.syncAvailabilityLevelFromTeam();
        this.syncFormationEditMembers();
        this.isEditingIdentity = false;
      },
      error: (err: any) => console.error('Erreur lors de la mise à jour', err)
    });
  }

  cancelConfirm(): void {
    this.showConfirmDialog = false;
  }

  closeFormationValidationDialog(): void {
    this.showFormationValidationDialog = false;
  }

  setTab(tab: TeamCreateTab, event?: Event): void {
    event?.preventDefault();
    this.activeTab = tab;
  }

  getMemberFullName(m: TeamMemberDto): string {
    const first = (m.firstName ?? '').charAt(0).toUpperCase() + (m.firstName ?? '').slice(1).toLowerCase();
    const last = (m.lastName ?? '').charAt(0).toUpperCase() + (m.lastName ?? '').slice(1).toLowerCase();
    return `${first} ${last}`.trim() || 'Joueur';
  }

  getMemberInitials(m: TeamMemberDto): string {
    const first = m.firstName?.[0] ?? '';
    const last = m.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase();
  }

  formatInputTime(time?: string): string {
    if (!time) {
      return '';
    }

    return time.length >= 5 ? time.slice(0, 5) : time;
  }

  private syncAvailabilityLevelFromTeam(): void {
    switch (this.team?.teamLevel) {
      case 'DEBUTANT':
        this.availabilityLevelValue = 0;
        return;
      case 'AVANCE':
        this.availabilityLevelValue = 100;
        return;
      default:
        this.availabilityLevelValue = 50;
    }
  }

  get formationMembers(): TeamMemberDto[] {
    return this.isEditingFormation ? this.editMembers : this.members;
  }

  get formationTitle(): string {
    const members = this.formationMembers;
    const goalkeepers = members.filter(member => member.position === 'GOALKEEPER' && member.selection === 'STARTER').length;
    const defenders = members.filter(member => member.position === 'DEFENDER' && member.selection === 'STARTER').length;
    const midfielders = members.filter(member => member.position === 'MIDFIELDER' && member.selection === 'STARTER').length;
    const attackers = members.filter(member => member.position === 'ATTACKER' && member.selection === 'STARTER').length;

    return `${goalkeepers}-${defenders}-${midfielders}-${attackers}`;
  }

  get starterMembersCount(): number {
    return this.formationMembers.filter(member => member.selection === 'STARTER').length;
  }

  get substituteMembers(): TeamMemberDto[] {
    return this.formationMembers.filter(member => member.selection === 'SUBSTITUTE');
  }

  get formationPitchSlots(): PitchSlot[] {
    const starters = this.formationMembers.filter(member => member.selection === 'STARTER');
    const goalkeepers = starters.filter(member => member.position === 'GOALKEEPER');
    const defenders = starters.filter(member => member.position === 'DEFENDER');
    const midfielders = starters.filter(member => member.position === 'MIDFIELDER');
    const attackers = starters.filter(member => member.position === 'ATTACKER');

    const formationVariant = this.getFormationVariant(defenders.length, midfielders.length, attackers.length);

    const attackerClasses = formationVariant === '1-1-1-2'
      ? ['token--str-left', 'token--str-right']
      : ['token--striker'];
    const midfielderClasses = formationVariant === '1-1-2-1'
      ? ['token--mid-left', 'token--mid-right']
      : ['token--middle'];
    const defenderClasses = formationVariant === '1-2-1-1'
      ? ['token--def-left', 'token--def-right']
      : ['token--defender'];

    return [
      ...this.buildPitchSlots('attacker', attackerClasses, attackers),
      ...this.buildPitchSlots('midfielder', midfielderClasses, midfielders),
      ...this.buildPitchSlots('defender', defenderClasses, defenders),
      ...this.buildPitchSlots('goalkeeper', ['token--gk'], goalkeepers)
    ];
  }

  getFormationMemberById(memberId?: number): TeamMemberDto | undefined {
    return this.editMembers.find(member => member.id === memberId);
  }

  positionLabel(position?: TeamMemberDto['position']): string {
    switch (position) {
      case 'GOALKEEPER':
        return 'Gardien';
      case 'DEFENDER':
        return 'Défenseur';
      case 'MIDFIELDER':
        return 'Milieu';
      case 'ATTACKER':
        return 'Attaquant';
      default:
        return '-';
    }
  }

  selectionLabel(selection?: TeamMemberDto['selection']): string {
    switch (selection) {
      case 'STARTER':
        return 'Titulaire';
      case 'SUBSTITUTE':
        return 'Remplaçant';
      default:
        return '-';
    }
  }

  positionDotClass(position?: TeamMemberDto['position']): string {
    switch (position) {
      case 'GOALKEEPER':
        return 'pos-pill__dot pos-pill__dot--green';
      case 'DEFENDER':
        return 'pos-pill__dot pos-pill__dot--red';
      case 'MIDFIELDER':
        return 'pos-pill__dot pos-pill__dot--yellow';
      case 'ATTACKER':
        return 'pos-pill__dot pos-pill__dot--blue';
      default:
        return 'pos-pill__dot pos-pill__dot--gray';
    }
  }

  trackMember(index: number, member: TeamMemberDto): number | string {
    return member.userId ?? member.id ?? index;
  }

  trackPitchSlot(index: number, slot: PitchSlot): string {
    return `${slot.key}-${slot.member?.id ?? index}`;
  }

  private validateFormation(): string[] {
    const errors: string[] = [];
    const members = this.editMembers;

    const starters = members.filter(member => member.selection === 'STARTER');
    const substitutesCount = members.filter(member => member.selection === 'SUBSTITUTE').length;

    const starterGoalkeepers = starters.filter(member => member.position === 'GOALKEEPER').length;
    const starterDefenders = starters.filter(member => member.position === 'DEFENDER').length;
    const starterMidfielders = starters.filter(member => member.position === 'MIDFIELDER').length;
    const starterAttackers = starters.filter(member => member.position === 'ATTACKER').length;

    const hasCompleteStarterLineup = starters.length === 5;

    if (hasCompleteStarterLineup && starterGoalkeepers < 1) {
      errors.push('Votre sélection titulaire doit contenir au minimum 1 gardien.');
    }

    if (hasCompleteStarterLineup && starterDefenders < 1) {
      errors.push('Votre sélection titulaire doit contenir au minimum 1 défenseur.');
    }

    if (hasCompleteStarterLineup && starterMidfielders < 1) {
      errors.push('Votre sélection titulaire doit contenir au minimum 1 milieu.');
    }

    if (hasCompleteStarterLineup && starterAttackers < 1) {
      errors.push('Votre sélection titulaire doit contenir au minimum 1 attaquant.');
    }

    if (starterDefenders > 2) {
      errors.push('Votre sélection titulaire ne peut pas contenir plus de 2 défenseurs.');
    }

    if (starterMidfielders > 2) {
      errors.push('Votre sélection titulaire ne peut pas contenir plus de 2 milieux.');
    }

    if (starterAttackers > 2) {
      errors.push('Votre sélection titulaire ne peut pas contenir plus de 2 attaquants.');
    }

    const doubledStarterLines = [starterDefenders, starterMidfielders, starterAttackers]
      .filter(count => count === 2).length;

    if (doubledStarterLines > 1) {
      errors.push('Votre formation doit respecter un seul schéma parmi 1-2-1-1, 1-1-2-1 ou 1-1-1-2. Un seul poste peut être en double entre défenseur, milieu et attaquant.');
    }

    if (hasCompleteStarterLineup && doubledStarterLines !== 1) {
      errors.push('Avec 5 titulaires, votre formation doit être 1-2-1-1, 1-1-2-1 ou 1-1-1-2.');
    }

    if (substitutesCount > 0 && starters.length < 5) {
      errors.push('Vous devez avoir 5 titulaires avant de pouvoir ajouter un remplaçant.');
    }

    return errors;
  }

  private getFormationVariant(defenders: number, midfielders: number, attackers: number): '1-2-1-1' | '1-1-2-1' | '1-1-1-2' {
    if (attackers >= 2) {
      return '1-1-1-2';
    }

    if (midfielders >= 2) {
      return '1-1-2-1';
    }

    return '1-2-1-1';
  }

  private buildPitchSlots(prefix: string, cssClasses: string[], members: TeamMemberDto[]): PitchSlot[] {
    return cssClasses.map((cssClass, index) => ({
      key: `${prefix}-${index}`,
      cssClass,
      member: members[index]
    }));
  }

  private syncFormationEditMembers(): void {
    this.editMembers = this.members.map(member => ({ ...member }));
  }

  isCurrentMember(member: TeamMemberDto): boolean {
    const me = this.currentUserId;
    const other = member.userId ?? null;
    return me != null && other != null && me === other;
  }

  openRemoveMemberDialog(member: TeamMemberDto): void {
    if (!member.userId || this.isCurrentMember(member)) {
      return;
    }

    this.memberToRemove = member;
    this.showRemoveMemberDialog = true;
  }

  confirmRemoveMember(): void {
    if (this.memberActionPending || !this.memberToRemove?.userId) {
      return;
    }

    this.memberActionPending = true;
    this.teamService.removeMemberFromMyTeam(this.memberToRemove.userId).subscribe({
      next: () => {
        this.teamService.findMyTeam().subscribe({
          next: (data) => {
            this.team = data;
            this.members = data?.members ?? [];
            this.syncFormationEditMembers();
            this.hasLeftTeam = this.members.length === 0;
            this.memberToRemove = null;
            this.showRemoveMemberDialog = false;
            this.memberActionPending = false;
          },
          error: (err: any) => {
            console.error("Erreur lors du rechargement de l'équipe", err);
            this.memberActionPending = false;
          }
        });
      },
      error: (err: any) => {
        console.error("Erreur lors de la sortie du joueur de l'équipe", err);
        this.memberActionPending = false;
      }
    });
  }

  cancelRemoveMember(): void {
    if (this.memberActionPending) {
      return;
    }

    this.memberToRemove = null;
    this.showRemoveMemberDialog = false;
  }

  get removeMemberDialogMessage(): string {
    if (!this.memberToRemove) {
      return '';
    }

    return `Voulez-vous vraiment sortir ${this.getMemberFullName(this.memberToRemove)} de l'équipe ?`;
  }

  get removeMemberDialogDetails(): string[] {
    return [
      "Le joueur sera retiré de la liste de sélection.",
      "Son statut passera immédiatement à Indisponible."
    ];
  }

  levelLabel(level?: string): string {
    switch (level) {
      case 'DEBUTANT':
        return 'Débutant';
      case 'INTERMEDIAIRE':
        return 'Intermédiaire';
      case 'CONFIRMER':
        return 'Confirmé';
      case 'AVANCE':
        return 'Avancé';
      default:
        return '-';
    }
  }

  levelBadgeClass(level?: string): string {
    switch (level) {
      case 'DEBUTANT':
        return 'badge--green';
      case 'INTERMEDIAIRE':
        return 'badge--blue';
      case 'CONFIRMER':
        return 'badge--yellow';
      case 'AVANCE':
        return 'badge--red';
      default:
        return 'badge--green';
    }
  }

  capitalize(value?: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
  
  getInvitationFullName(invitation: TeamInvitationDto): string {
    const first = this.capitalize(invitation.invitedUserFirstName);
    const last = this.capitalize(invitation.invitedUserLastName);
    return `${first} ${last}`.trim() || 'Joueur';
  }

  getInvitationInitials(invitation: TeamInvitationDto): string {
    const first = invitation.invitedUserFirstName?.[0] ?? '';
    const last = invitation.invitedUserLastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || 'J';
  }

  formatInvitationDate(date?: string): string {
    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatInvitationTime(time?: string): string {
    if (!time) {
      return '-';
    }

    return time.slice(0, 5);
  }

  invitationStatusLabel(status?: TeamInvitationDto['status']): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'En Attente';
      case 'ACCEPTEE':
        return 'Acceptée';
      case 'REFUSEE':
        return 'Refusée';
      case 'ANNULLEE':
        return 'Annulée';
      default:
        return '-';
    }
  }

  invitationStatusClass(status?: TeamInvitationDto['status']): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'recruit-item__action recruit-item__action--pending';
      case 'ACCEPTEE':
        return 'recruit-item__action recruit-item__action--accepted';
      case 'REFUSEE':
        return 'recruit-item__action recruit-item__action--rejected';
      case 'ANNULLEE':
        return 'recruit-item__action recruit-item__action--cancelled';
      default:
        return 'recruit-item__action recruit-item__action--pending';
    }
  }
}
