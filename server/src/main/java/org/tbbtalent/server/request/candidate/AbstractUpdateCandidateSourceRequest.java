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

package org.tbbtalent.server.request.candidate;

import javax.validation.constraints.NotBlank;

import org.springframework.lang.Nullable;
import org.tbbtalent.server.model.db.AbstractCandidateSource;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

/**
 * Base class for any Update/Create requests on candidate sources 
 * (sublasses of {@link AbstractCandidateSource}).
 *
 * @author John Cameron
 */
@Getter
@Setter
@ToString
public abstract class AbstractUpdateCandidateSourceRequest {

    /**
     * @see AbstractCandidateSource
     */
    @NotBlank
    private String name;

    /**
     * @see AbstractCandidateSource
     */
    private Boolean fixed;

    /**
     * @see AbstractCandidateSource
     */
    @Nullable
    private String sfJoblink;

    public void populateFromRequest(AbstractCandidateSource candidateSource) {
        candidateSource.setName(name);
        candidateSource.setFixed(fixed);
        candidateSource.setSfJoblink(sfJoblink);
    }
}
