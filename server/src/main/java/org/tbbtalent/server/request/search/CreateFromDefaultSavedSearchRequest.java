/*
 * Copyright (c) 2020 Talent Beyond Boundaries. All rights reserved.
 */

package org.tbbtalent.server.request.search;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CreateFromDefaultSavedSearchRequest {
    /**
     * If not zero, the new saved search should take its name from the name of
     * the saved list with this id.
     * <p/>
     * Otherwise the saved search name is given by the "name" attribute.
     */
    private long savedListId;

    /**
     * Only used if savedListId is null. In that case this must not be null and
     * is used to name the new search.
     */
    private String name;

    /**
     * This sfJobLink should be associated with the newly created search.
     */
    private String sfJoblink;
}
