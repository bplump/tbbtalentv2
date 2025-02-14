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

package org.tbbtalent.server.model.sf;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Base class for Salesforce objects
 *
 * @author John Cameron
 */
@Getter
@Setter
@ToString
public abstract class SalesforceObjectBase {
  static final String urlRoot = "https://talentbeyondboundaries.lightning.force.com/lightning/r/";
  static final String urlSuffix = "/view";

  public String Id;

  /**
   * This is the name of this class of object as referred to in SF urls
   * @return Name object used in urls - eg Contact or Opportunity
   */
  abstract String getSfObjectName();

  public String getUrl() {
    String url = null;
    if (Id != null) {
      url = urlRoot + getSfObjectName() + "/" + Id + urlSuffix;
    }
    return url;
  }
}
