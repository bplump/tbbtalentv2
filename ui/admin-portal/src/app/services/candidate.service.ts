/*
 * Copyright (c) 2021 Talent Beyond Boundaries.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

import {Injectable} from '@angular/core';
import {
  Candidate,
  CandidateIntakeData,
  SalesforceOppParams,
  UpdateCandidateListOppsRequest,
  UpdateCandidateOppsRequest,
  UpdateCandidateShareableNotesRequest,
  UpdateCandidateStatusRequest
} from '../model/candidate';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {SearchResults} from '../model/search-results';
import {map} from "rxjs/operators";
import {CandidateSource} from "../model/base";
import {isSavedSearch} from "../model/saved-search";

@Injectable({providedIn: 'root'})
export class CandidateService {

  private apiUrl = environment.apiUrl + '/candidate';

  constructor(private http: HttpClient) {}

  search(request): Observable<SearchResults<Candidate>> {
    return this.http.post<SearchResults<Candidate>>(`${this.apiUrl}/search`, request);
  }

  findByCandidateEmail(request): Observable<SearchResults<Candidate>> {
    return this.http.post<SearchResults<Candidate>>(`${this.apiUrl}/findbyemail`, request);
  }

  findByCandidateNumberOrName(request): Observable<SearchResults<Candidate>> {
    return this.http.post<SearchResults<Candidate>>(`${this.apiUrl}/findbynumberorname`, request);
  }

  findByCandidatePhone(request): Observable<SearchResults<Candidate>> {
    return this.http.post<SearchResults<Candidate>>(`${this.apiUrl}/findbyphone`, request);
  }

  getByNumber(number: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/number/${number}`);
  }

  get(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
  }

  getIntakeData(id: number): Observable<CandidateIntakeData> {
    return this.http.get<CandidateIntakeData>(`${this.apiUrl}/${id}/intake`);
  }

  create(details): Observable<Candidate>  {
    return this.http.post<Candidate>(`${this.apiUrl}`, details);
  }

  updateLinks(id: number, details): Observable<Candidate>  {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}/links`, details);
  }

  updateShareableNotes(
    id: number, request: UpdateCandidateShareableNotesRequest): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}/shareable-notes`, request);
  }

  updateStatus(details: UpdateCandidateStatusRequest): Observable<void>  {
    return this.http.put<void>(`${this.apiUrl}/status`, details);
  }

  updateInfo(id: number, details): Observable<Candidate>  {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}/info`, details);
  }

  updateSurvey(id: number, details): Observable<Candidate>  {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}/survey`, details);
  }

  update(id: number, details): Observable<Candidate>  {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}`, details);
  }

  delete(id: number): Observable<boolean>  {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  export(request) {
    return this.http.post(`${this.apiUrl}/export/csv`, request, {responseType: 'blob'});
  }

  downloadCv(candidateId: number) {
    return this.http.get(
      `${this.apiUrl}/${candidateId}/cv.pdf`,
      {responseType: 'blob'})
      .pipe(
        map(res => {
          return new Blob([res], { type: 'application/pdf', });
        })
      );
  }

  createCandidateFolder(candidateId: number): Observable<Candidate> {
    return this.http.put<Candidate>(
      `${this.apiUrl}/${candidateId}/create-folder`, null);
  }

  createUpdateSalesforce(candidateId: number): Observable<Candidate> {
    return this.http.put<Candidate>(
      `${this.apiUrl}/${candidateId}/update-sf`, null);
  }

  createUpdateSalesforceFromList(source: CandidateSource,
                                 salesforceOppParams: SalesforceOppParams): Observable<void> {

    const request: UpdateCandidateListOppsRequest = {
      savedListId: source.id,
      salesforceOppParams: salesforceOppParams
    }
    return this.http.put<void>(`${this.apiUrl}/update-sf-by-list`, request);
  }

  createUpdateSalesforceFromCandidates(
    candidateIds: number[], sfJobLink: string, salesforceOppParams: SalesforceOppParams): Observable<void> {

    const request: UpdateCandidateOppsRequest = {
      candidateIds: candidateIds,
      sfJobLink: sfJobLink,
      salesforceOppParams: salesforceOppParams
    }

    return this.http.put<void>(`${this.apiUrl}/update-sf`, request);
  }

  /**
   * Note that the sent data, formData, is not typed.
   * The data is copied across using the name of the form fields.
   * Those names must match field names in CandidateIntakeDataUpdate.java.
   * @param candidateId ID of candidate
   * @param formData form.value of an intake data form.
   */
  updateIntakeData(candidateId: number, formData: Object): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${candidateId}/intake`, formData);
  }
}
