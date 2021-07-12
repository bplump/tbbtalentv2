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

import java.io.IOException;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.web.multipart.MultipartFile;
import org.tbbtalent.server.exception.EntityExistsException;
import org.tbbtalent.server.exception.InvalidRequestException;
import org.tbbtalent.server.exception.NoSuchObjectException;
import org.tbbtalent.server.model.db.SavedList;
import org.tbbtalent.server.model.db.User;
import org.tbbtalent.server.request.candidate.UpdateDisplayedFieldPathsRequest;
import org.tbbtalent.server.request.candidate.source.CopySourceContentsRequest;
import org.tbbtalent.server.request.list.SearchSavedListRequest;
import org.tbbtalent.server.request.list.UpdateExplicitSavedListContentsRequest;
import org.tbbtalent.server.request.list.UpdateSavedListInfoRequest;
import org.tbbtalent.server.request.search.UpdateSharingRequest;

/**
 * Saved List Service
 *
 * @author John Cameron
 */
public interface SavedListService {

    /**
     * Clear the contents of the SavedList with the given ID
     * @param savedListId ID of SavedList to clear
     * @return False if no saved list with that id was found, otherwise true.
     */
    boolean clearSavedList(long savedListId) throws InvalidRequestException;

    /**
     * Copies the given list to the list specified in the given request (which
     * may be a requested new list).
     * @param id ID of list to be copied
     * @param request Defines the target list and also whether copy is a 
     *                replace or an add.
     * @return The target list                
     * @throws EntityExistsException If a new list needs to be created but the
     * list name already exists.
     * @throws NoSuchObjectException if there is no saved list matching the id
     * or the target list id. 
     */
    SavedList copy(long id, CopySourceContentsRequest request)
            throws EntityExistsException, NoSuchObjectException;

    /**
     * Copies the given list to the list specified in the given request (which
     * may be a requested new list).
     * @param sourceList List to be copied
     * @param request Defines the target list and also whether copy is a 
     *                replace or an add.
     * @return The target list                
     * @throws EntityExistsException If a new list needs to be created but the
     * list name already exists.
     * @throws NoSuchObjectException if there is no saved list matching the target list id. 
     */
    SavedList copy(SavedList sourceList, CopySourceContentsRequest request)
            throws EntityExistsException, NoSuchObjectException;

    /**
     * Copies the contents (candidates plus any context notes) from the 
     * source list to the destination.
     * Note that other list info (eg name, sfJoblink and other attributes are
     * not copied).
     * @param source List to copy from
     * @param destination List to copy to
     */
    void copyContents(SavedList source, SavedList destination, boolean replace);

    /**
     * Copies the contents (candidates plus any context notes) from the 
     * candidates specified in the request to the destination.
     * @param request Contains the candidates to be copied including where those
     *                candidates came from. Also may contain updateStatusInfo.
     * @param destination List to copy to
     */
    void copyContents(UpdateExplicitSavedListContentsRequest request, SavedList destination);

    /**
     * Create a new SavedList 
     * @param request Create request
     * @return Created saved list
     * @throws EntityExistsException if a list with this name already exists.
     */
    SavedList createSavedList(UpdateSavedListInfoRequest request) 
            throws EntityExistsException;

    /**
     * Create a new SavedList
     * @param user User to be recorded as creator of saved list
     * @param request Create request
     * @return Created saved list
     * @throws EntityExistsException if a list with this name already exists.
     */
    SavedList createSavedList(User user, UpdateSavedListInfoRequest request) 
            throws EntityExistsException;

    /**
     * Delete the SavedList with the given ID
     * @param savedListId ID of SavedList to delete
     * @return True if delete was successful
     * @throws InvalidRequestException if not authorized to delete this list.
     */
    boolean deleteSavedList(long savedListId) throws InvalidRequestException;

    /**
     * Get the SavedList with the given id.
     * @param savedListId ID of SavedList to get 
     * @return Saved list
     * @throws NoSuchObjectException if there is no saved list with this id. 
     */
    @NonNull
    SavedList get(long savedListId) throws NoSuchObjectException;

    /**
     * Get the SavedList, if any, with the given name (ignoring case), owned by the given user.
     * @param user Owner of list
     * @param listName Name of list (case insensitive - eg "test" will match "Test")
     * @return Saved list or null if not found
     */
    @Nullable
    SavedList get(@NonNull User user, String listName);

    /**
     * Return all SavedList's associated with the given candidate that match 
     * the given request, ordered by name.
     * <p/>
     * See also {@link #listSavedLists} which does the same except for
     * any candidate.
     * 
     * @param candidateId Candidate whose lists we are searching
     * @param request Defines which SavedList's to return 
     * @return Matching SavedList's
     */
    List<SavedList> search(long candidateId, SearchSavedListRequest request);

    /**
     * Return all SavedList's that match the given request, ordered by name.
     * <p/>
     * See also {@link #searchSavedLists} which does the same except
     * returns just one page of results.
     * @param request Defines which SavedList's to return
     * @return Matching SavedList's
     */
    List<SavedList> listSavedLists(SearchSavedListRequest request);

    /**
     * Merge the contents of the SavedList with the given id with the 
     * candidates indicated in the given request.
     * @param savedListId ID of saved list to be updated
     * @param request Request containing the contents to be merged into the list
     * @throws NoSuchObjectException if there is no saved list with this id
     */
    void mergeSavedList(long savedListId, UpdateExplicitSavedListContentsRequest request)
        throws NoSuchObjectException;

    /**
     * Merge the contents of the SavedList with the given id with the 
     * candidates whose candidate numbers (NOT ids) appear in the given file.
     * @param savedListId ID of saved list to be updated
     * @param file File containing candidate numbers, one to a line
     * @throws NoSuchObjectException if there is no saved list with this id
     * or if any of the candidate numbers are not numeric or do not correspond to a candidate
     * @throws IOException If there is a problem reading the file
     */
    void mergeSavedListFromFile(long savedListId, MultipartFile file)
        throws NoSuchObjectException, IOException;

    /**
     * Remove the candidates indicated in the given request from the SavedList 
     * with the given id.
     * @param savedListId ID of saved list to be updated
     * @param request Request containing the new list contents
     * @throws NoSuchObjectException if there is no saved list with this id
     */
    void removeFromSavedList(long savedListId, UpdateExplicitSavedListContentsRequest request)
        throws NoSuchObjectException;

    /**
     * Return a page of SavedList's that match the given request, ordered by
     * name.
     * <p/>
     * See also {@link #listSavedLists} which does the same except it
     * returns all matching results.
     * @param request Defines which SavedList's to return
     * @return Matching SavedList's
     */
    Page<SavedList> searchSavedLists(SearchSavedListRequest request);

    /**
     * Update the info associated with the SavedList with the given id 
     * - for example changing its name. 
     * @param savedListId ID of saved list to be updated
     * @param request Request containing the new list info
     * @return Updated saved list
     * @throws NoSuchObjectException if there is no saved list with this id. 
     * @throws EntityExistsException if a list with the requested name already exists.
     */
    SavedList updateSavedList(long savedListId, UpdateSavedListInfoRequest request)
            throws NoSuchObjectException, EntityExistsException;


    /**
     * Adds a user who wants to share the given saved list (created by someone 
     * else).
     * @param id id of Saved List being shared
     * @param request Contains the id of the user who is sharing the list
     * @return The updated saved list with a modified collection of users
     * who are sharing it.
     * @throws NoSuchObjectException if there is no saved list with this id
     * or the user is not found.
     */
    SavedList addSharedUser(long id, UpdateSharingRequest request)
            throws NoSuchObjectException;

    /**
     * Removes a user who was sharing the given saved list (created by someone 
     * else).
     * @param id id of Saved List
     * @param request Contains the id of the user who is no longer interested
     *                in sharing the list
     * @return The updated saved list with a modified collection of users
     * who are sharing it.
     * @throws NoSuchObjectException if there is no saved list with this id
     * or the user is not found.
     */
    SavedList removeSharedUser(long id, UpdateSharingRequest request)
            throws NoSuchObjectException;
    
    /**
     * Updates the fields that are displayed for each candidate in the given 
     * saved list.
     * @param savedListId Id of saved list
     * @param request Request containing the field paths to be displayed.
     * @throws NoSuchObjectException  if there is no saved list with this id
     */
    void updateDisplayedFieldPaths(
            long savedListId, UpdateDisplayedFieldPathsRequest request)
            throws NoSuchObjectException;
}
