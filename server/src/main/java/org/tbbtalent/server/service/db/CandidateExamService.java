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

package org.tbbtalent.server.service.db;

import org.tbbtalent.server.exception.NoSuchObjectException;
import org.tbbtalent.server.model.db.CandidateExam;
import org.tbbtalent.server.request.candidate.exam.CreateCandidateExamRequest;

public interface CandidateExamService {

    /**
     * Creates a new candidate exam record from the data in the given
     * request.
     * @param candidateId ID of candidate
     * @param request Request containing exam details
     * @return Created record - including database id of exam record
     * @throws NoSuchObjectException if the there is no Candidate record with
     * that candidateId or no Nationality with the id given in the request
     */
    CandidateExam createExam(
            long candidateId, CreateCandidateExamRequest request)
            throws NoSuchObjectException;
}
