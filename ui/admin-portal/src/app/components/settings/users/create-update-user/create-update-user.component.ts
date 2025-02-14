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

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Role, UpdateUserRequest, User} from "../../../../model/user";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UserService} from "../../../../services/user.service";
import {AuthService} from "../../../../services/auth.service";
import {CountryService} from "../../../../services/country.service";
import {Country} from "../../../../model/country";
import {EnumOption, enumOptions} from "../../../../util/enum";
import {PartnerService} from "../../../../services/partner.service";
import {Partner} from "../../../../model/partner";
import {forkJoin} from "rxjs";
import {Status} from "../../../../model/base";

@Component({
  selector: 'app-create-update-user',
  templateUrl: './create-update-user.component.html',
  styleUrls: ['./create-update-user.component.scss']
})
export class CreateUpdateUserComponent implements OnInit {

  user: User;
  userForm: FormGroup;
  error;
  working: boolean;

  roleOptions: EnumOption[] = enumOptions(Role);
  countries: Country[];
  partners: Partner[];

  constructor(private activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private partnerService: PartnerService,
              private userService: UserService,
              private authService: AuthService,
              private countryService: CountryService) {
  }

  ngOnInit() {
    let formControlsConfig = {
      email: [this.user?.email, [Validators.required, Validators.email]],
      username: [this.user?.username, Validators.required],
      firstName: [this.user?.firstName, Validators.required],
      lastName: [this.user?.lastName, Validators.required],
      partnerId: [this.user?.sourcePartner.id],
      status: [this.user ? this.user.status : Status.active],
      role: [this.user?.role, Validators.required],
      sourceCountries: [this.user?.sourceCountries],
      readOnly: [this.user ? this.user.readOnly : false],
      usingMfa: [this.user ? this.user.usingMfa : true]
    }

    //Password is required field in user creation only
    if (this.create) {
      formControlsConfig["password"] = [null, Validators.required];
    }

    this.userForm = this.fb.group(formControlsConfig);

    this.working = true;
    this.error = null;

    forkJoin({
      'countries': this.countryService.listCountriesRestricted(),
      'partners': this.partnerService.listPartners()
    }).subscribe(
      results => {
        this.working = false;
        this.countries = results['countries'];
        this.partners = results['partners'];
      },
      (error) => {
        this.error = error;
        this.working = false;
      }
    );

    //Filter who can set which roles
    const role = this.authService.getLoggedInRole();
    if (role === Role.admin) {
      this.roleOptions = this.roleOptions.filter(
        r => ![Role.systemadmin].includes(Role[r.key]));
    }

    if (role === Role.sourcepartneradmin) {
      this.roleOptions = this.roleOptions.filter(
        r => ![Role.systemadmin, Role.admin].includes(Role[r.key]));
    }

  }

  get create(): boolean {
    return !this.user;
  }

  get title(): string {
    return this.create ? "Add New User"
      : "Update User";
  }

  onSave() {
    this.working = true;

    const request: UpdateUserRequest = {
      email: this.userForm.value.email,
      firstName: this.userForm.value.firstName,
      lastName: this.userForm.value.lastName,
      partnerId: this.userForm.value.partnerId,
      readOnly: this.userForm.value.readOnly,
      role: this.userForm.value.role,
      sourceCountries: this.userForm.value.sourceCountries,
      status: this.userForm.value.status,
      username: this.userForm.value.username,
      usingMfa: this.userForm.value.usingMfa
    }

    if (this.create) {
      request.password = this.userForm.value.password;
      this.userService.create(request).subscribe(
        (user) => {
          this.closeModal(user);
          this.working = false;
        },
        (error) => {
          this.error = error;
          this.working = false;
        });

    } else {
      this.userService.update(this.user.id, request).subscribe(
        (user) => {
          this.closeModal(user);
          this.working = false;
        },
        (error) => {
          this.error = error;
          this.working = false;
        });
    }
  }

  closeModal(user: User) {
    this.activeModal.close(user);
  }

  dismiss() {
    this.activeModal.dismiss(false);
  }

  canAssignPartner(): boolean {
    return this.authService.canAssignPartner();
  }
}
