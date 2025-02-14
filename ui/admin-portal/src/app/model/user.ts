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

import {Country} from "./country";
import {Partner} from "./partner";

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  readOnly: boolean;
  sourceCountries: Country[];
  status: string;
  createdDate: number;
  createdBy: User;
  updatedDate: number;
  lastLogin: number;
  usingMfa: boolean;
  mfaConfigured: boolean;
  sourcePartner: Partner;
}

export interface UpdateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  partnerId: number;
  password?: string;
  readOnly: boolean;
  role: string;
  sourceCountries: Country[];
  status: string;
  username: string;
  usingMfa: boolean;
}

export enum Role {
  systemadmin = "System Admin",
  admin = "Full Admin",
  sourcepartneradmin = "Source Partner Admin",
  semilimited = "Semi Limited",
  limited = "Limited"
}

export function roleGreaterThan(role1: Role, role2: Role): boolean {

  //Populate this array with roles that are greater than role2
  let greaterRoles: Role[];
  switch (role2) {
    case Role.systemadmin:
      greaterRoles = [];
      break;

    case Role.admin:
      greaterRoles = [Role.systemadmin]
      break;

    case Role.sourcepartneradmin:
      greaterRoles = [Role.admin, Role.systemadmin]
      break;

    case Role.semilimited:
      greaterRoles = [Role.sourcepartneradmin, Role.admin, Role.systemadmin]
      break;

    case Role.limited:
      greaterRoles = [Role.semilimited, Role.sourcepartneradmin, Role.admin, Role.systemadmin]
      break;
  }

  return greaterRoles.includes(role1);
}
