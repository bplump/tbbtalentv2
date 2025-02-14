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

package org.tbbtalent.server.repository.db;

import static org.tbbtalent.server.repository.db.CandidateSpecificationUtil.getOrderByOrders;

import java.util.List;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Fetch;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.tbbtalent.server.model.db.Candidate;
import org.tbbtalent.server.model.db.CandidateSavedList;
import org.tbbtalent.server.request.candidate.SavedListGetRequest;

/**
 * MODEL - Alternate way of creating JPA Specifications
 *
 * "Specification" which defines the database query to retrieve all candidates
 * in a Saved List based on a {@link SavedListGetRequest}.
 * <p>
 *   To me, this is a more comprehensible way of using the {@link Specification}
 *   interface.
 * </p>
 * <p>
 *     Instead of calling a static buildQuery method, you just pass in an
 *     instance of this to the JPA {@link CandidateRepository#findAll} method.
 *     The instance is created by passing the {@link SavedListGetRequest} to
 *     the constructor.
 * </p>
 * <p>
 *     Note that this Specification query handles the sorting internally
 *     so the {@link PageRequest} passed in should not provide any sorts.
 *     You can get this by calling
 *     {@link SavedListGetRequest#getPageRequestWithoutSort()}
 * </p>
 *     eg:
 *     <code>
 *     PageRequest pageRequest = request.getPageRequestWithoutSort();
 *     Page<Candidate> candidatesPage = candidateRepository.findAll(
 *                 new GetSavedListCandidatesQuery(request), pageRequest);
 *     </code>
 */
@RequiredArgsConstructor
public class GetSavedListCandidatesQuery implements Specification<Candidate> {
    private final long savedListId;
    private final SavedListGetRequest request;

    @Override
    public Predicate toPredicate(Root<Candidate> candidate,
                                 CriteriaQuery<?> query, CriteriaBuilder cb) {

        //Start by adding fetches and Order by
        boolean isCountQuery = query.getResultType().equals(Long.class);
        if (!isCountQuery) {
            //Fetch to populate the key linked entities
            Fetch<Object, Object> userFetch = candidate.fetch("user", JoinType.LEFT);
            Fetch<Object, Object> partnerFetch = userFetch.fetch("sourcePartner", JoinType.LEFT);
            Fetch<Object, Object> nationalityFetch = candidate.fetch("nationality", JoinType.LEFT);
            Fetch<Object, Object> countryFetch = candidate.fetch("country", JoinType.LEFT);
            Fetch<Object, Object> educationLevelFetch = candidate.fetch("maxEducationLevel", JoinType.LEFT);

            //Do sorting by passing in the equivalent joins
            List<Order> orders = getOrderByOrders(request, candidate, cb,
                    (Join<Object, Object>) userFetch,
                    (Join<Object, Object>) partnerFetch,
                    (Join<Object, Object>) nationalityFetch,
                    (Join<Object, Object>) countryFetch,
                    (Join<Object, Object>) educationLevelFetch);
            query.orderBy(orders);
        }

        //Now construct the actual query
        /*
        select candidate from candidate
        where candidate in
            (select candidate from candidateSavedList
                where savedList.id = savedListID)
         */
        Subquery<Candidate> sq = query.subquery(Candidate.class);
        Root<CandidateSavedList> csl = sq.from(CandidateSavedList.class);

        // KEYWORD SEARCH
        if (!StringUtils.isBlank(request.getKeyword())){
            String lowerCaseMatchTerm = request.getKeyword().toLowerCase();
            String likeMatchTerm = "%" + lowerCaseMatchTerm + "%";
            sq.select(csl.get("candidate")).where(cb.and(
                    cb.equal(csl.get("savedList").get("id"), savedListId),
                    cb.or(
                        cb.like(cb.lower(candidate.get("candidateNumber")), likeMatchTerm),
                        cb.like(cb.lower(candidate.get("user").get("firstName")), likeMatchTerm),
                        cb.like(cb.lower(candidate.get("user").get("lastName")), likeMatchTerm),
                        cb.like(cb.lower(
                                    cb.concat(
                                        cb.concat(candidate.get("user").get("firstName"), " "),
                                        candidate.get("user").get("lastName")
                                    )), likeMatchTerm)
                    )
            ));
        } else {
            sq.select(csl.get("candidate")).where(cb.equal(csl.get("savedList").get("id"), savedListId));
        }

        return cb.in(candidate).value(sq);
    }
}
