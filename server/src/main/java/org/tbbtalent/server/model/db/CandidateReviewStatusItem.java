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

package org.tbbtalent.server.model.db;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

/**
 * This indicates whether a candidate who turns up in a saved search really belongs in that search.
 * <p/>
 * For example a candidate may have recorded in his profile that their favourite film is the
 * "The Fabulous Baker Boys". That could mean that the candidate will appear in the
 * saved search for bakers! You could just modify the candidate's profile to remove that movie
 * preference - but you may not want to do that. Another way is to note that the candidate does
 * not really belong in the "Baker" saved search. You can do that by creating one of these objects
 * - setting the reviewStatus to {@link ReviewStatus#rejected}. Then the candidate will not longer
 * appear in the search (unless you explicitly ask to see candidates rejected from the search).
 */
@Entity
@Table(name = "candidate_review_item")
@SequenceGenerator(name = "seq_gen", sequenceName = "candidate_review_item_id_seq", allocationSize = 1)
public class CandidateReviewStatusItem extends AbstractAuditableDomainObject<Long>  {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id")
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saved_search_id")
    private SavedSearch savedSearch;

    private String comment;

    @Enumerated(EnumType.STRING)
    private ReviewStatus reviewStatus;

    public CandidateReviewStatusItem() {
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }

    public SavedSearch getSavedSearch() {
        return savedSearch;
    }

    public void setSavedSearch(SavedSearch savedSearch) {
        this.savedSearch = savedSearch;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public ReviewStatus getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(ReviewStatus reviewStatus) {
        this.reviewStatus = reviewStatus;
    }
}
