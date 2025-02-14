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
import {JwtResponse} from "../model/jwt-response";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {LocalStorageService} from "angular-2-local-storage";
import {User} from "../model/user";
import {LoginRequest, RegisterCandidateRequest} from "../model/candidate";

export class AuthorizeInContextTranslationRequest {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = environment.apiUrl + '/auth';

  private user: User;
  private _user: BehaviorSubject<User> = new BehaviorSubject(this.getLoggedInUser());
  public readonly user$: Observable<User> = this._user.asObservable();

  constructor(private router: Router,
              private http: HttpClient,
              private localStorageService: LocalStorageService) {
  }

  login(credentials: LoginRequest) {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      map((response: JwtResponse) => {
        this.storeCredentials(response);
      }),
      catchError(e => {
          // console.log('error', e);
          return throwError(e);
        }
      )
    );
  }

  authorizeInContextTranslation(password: string): Observable<void> {
    const request: AuthorizeInContextTranslationRequest = {
      password: password
    }
    return this.http.post<void>(`${this.apiUrl}/xlate`, request);
  }

  isAuthenticated(): boolean {
    return this.getLoggedInUser() != null;
  }

  getLoggedInUser(): User {
    if (!this.user) {
      // could be a page reload, check localstorage
      const user = this.localStorageService.get('user');
      this.user = <User>user;
    }
    return this.user;
  }

  getToken(): string {
    return this.localStorageService.get('access-token');
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, null).pipe(
      map(() => this.clearCredentials()),
      catchError(e => throwError(e))
    );
  }

  register(request: RegisterCandidateRequest) {
    return this.http.post<JwtResponse>(`${this.apiUrl}/register`, request).pipe(
      map((response) => this.storeCredentials(response)),
      catchError((e) => throwError(e))
    );
  }

  private storeCredentials(response: JwtResponse) {
    this.clearCredentials();
    this.localStorageService.set('access-token', response.accessToken);
    this.localStorageService.set('user', response.user);
    this._user.next(response.user);
  }

  private clearCredentials() {
    this.localStorageService.remove('access-token');
    this.localStorageService.remove('user');
    this.user = null;
    this._user.next(this.user);
  }

}
