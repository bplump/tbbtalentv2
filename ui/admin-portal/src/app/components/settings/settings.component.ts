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

import {AfterViewChecked, Component, OnInit, ViewChild} from '@angular/core';
import {User} from "../../model/user";
import {AuthService} from "../../services/auth.service";
import {NgbNav, NgbNavChangeEvent} from "@ng-bootstrap/ng-bootstrap";
import {LocalStorageService} from "angular-2-local-storage";


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, AfterViewChecked {

  loggedInUser: User;
  activeTabId: string;
  private lastTabKey: string = 'SettingsLastTab';

  //Get reference to the nav element
  @ViewChild(NgbNav)
  nav: NgbNav;

  constructor(
    private authService: AuthService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(){
    /* GET LOGGED IN USER ROLE FROM LOCAL STORAGE */
    this.loggedInUser = this.authService.getLoggedInUser();
  }

  ngAfterViewChecked(): void {
    //This is called in order for the navigation tabs, this.nav, to be set.
    this.selectDefaultTab()
  }

  onTabChanged(event: NgbNavChangeEvent) {
    this.setActiveTabId(event.nextId);
  }

  private setActiveTabId(id: string) {
    this.nav?.select(id);
    this.localStorageService.set(this.lastTabKey, id);
  }

  private selectDefaultTab() {
    const defaultActiveTabID: string = this.localStorageService.get(this.lastTabKey);
    this.setActiveTabId(defaultActiveTabID == null ? "users" : defaultActiveTabID);
  }

  systemAdminOnly(): boolean {
    return this.authService.isSystemAdminOnly();
  }

  adminOrGreater(): boolean {
    return this.authService.isAdminOrGreater();
  }

  sourcePartnerAdminOrGreater(): boolean {
    return this.authService.isSourcePartnerAdminOrGreater();
  }
}
