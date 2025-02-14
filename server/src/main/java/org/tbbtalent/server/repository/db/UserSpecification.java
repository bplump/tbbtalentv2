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

import io.jsonwebtoken.lang.Collections;
import javax.persistence.criteria.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;
import org.tbbtalent.server.model.db.Role;
import org.tbbtalent.server.model.db.User;
import org.tbbtalent.server.request.user.SearchUserRequest;

public class UserSpecification {

    public static Specification<User> buildSearchQuery(final SearchUserRequest request) {
        return (user, query, builder) -> {
            Predicate conjunction = builder.conjunction();
            query.distinct(true);

            // KEYWORD SEARCH
            if (!StringUtils.isBlank(request.getKeyword())){
                String lowerCaseMatchTerm = request.getKeyword().toLowerCase();
                String likeMatchTerm = "%" + lowerCaseMatchTerm + "%";
                conjunction.getExpressions().add(
                        builder.or(
                                builder.like(builder.lower(user.get("firstName")), likeMatchTerm),
                                builder.like(builder.lower(user.get("lastName")), likeMatchTerm),
                                builder.like(builder.lower(user.get("email")), likeMatchTerm),
                                builder.like(builder.lower(user.get("username")), likeMatchTerm)
                        ));
            }

            // ROLE SEARCH
            if (Collections.isEmpty(request.getRole())) {
                //If no roles specified, just exclude candidate users.
                conjunction.getExpressions().add(
                    builder.notEqual(user.get("role"), Role.user)
                );
            } else {
                conjunction.getExpressions().add(
                        builder.isTrue(user.get("role").in(request.getRole()))
                );
            }

            if (request.getStatus() != null){
                conjunction.getExpressions().add(builder.equal(user.get("status"), request.getStatus()));
            }

            return conjunction;
        };
    }

}
