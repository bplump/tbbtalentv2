/*
 * Copyright (c) 2022 Talent Beyond Boundaries.
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

package org.tbbtalent.server.request.job;

import java.util.List;
import javax.annotation.Nullable;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.tbbtalent.server.model.db.JobOpportunityStage;
import org.tbbtalent.server.request.candidate.source.SearchCandidateSourceRequestPaged;

@Getter
@Setter
@ToString
public class SearchJobRequest extends SearchCandidateSourceRequestPaged {

    /**
     * If specified, job opportunities will be selected based on whether the opportunity is closed.
     */
    @Nullable
    private Boolean sfOppClosed;

    /**
     * If specified, job opportunities are selected if they match any of the stages
     */
    @Nullable
    private List<JobOpportunityStage> stages;

}
