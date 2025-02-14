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

package org.tbbtalent.server.request.opportunity;

import javax.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Base class for objects containing job related links.
 *
 * @author John Cameron
 */
@Getter
@Setter
@ToString
public class HasJobRelatedLinksImpl {

  /**
   * Link to Salesforce employer job opportunity
   */
  @NotBlank
  private String sfJoblink;
  /**
   * Link to associated Talent Catalog list
   */
  private String listlink;
  /**
   * Link to associated Google Drive root folder
   */
  private String folderlink;
  /**
   * Link to associated Google Drive CVs subfolder
   */
  private String foldercvlink;
  /**
   * Link to associated Google Drive Job Description subfolder
   */
  private String folderjdlink;
}
