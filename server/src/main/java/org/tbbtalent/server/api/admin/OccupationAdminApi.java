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

package org.tbbtalent.server.api.admin;

import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tbbtalent.server.exception.EntityExistsException;
import org.tbbtalent.server.exception.EntityReferencedException;
import org.tbbtalent.server.model.db.Occupation;
import org.tbbtalent.server.request.occupation.CreateOccupationRequest;
import org.tbbtalent.server.request.occupation.SearchOccupationRequest;
import org.tbbtalent.server.request.occupation.UpdateOccupationRequest;
import org.tbbtalent.server.service.db.OccupationService;
import org.tbbtalent.server.util.dto.DtoBuilder;

@RestController()
@RequestMapping("/api/admin/occupation")
public class OccupationAdminApi {

    private final OccupationService occupationService;

    @Autowired
    public OccupationAdminApi(OccupationService occupationService) {
        this.occupationService = occupationService;
    }

    @GetMapping()
    public List<Map<String, Object>> listAllOccupations() {
        List<Occupation> occupations = occupationService.listOccupations();
        return occupationDto().buildList(occupations);
    }

    @PostMapping("search")
    public Map<String, Object> search(@RequestBody SearchOccupationRequest request) {
        Page<Occupation> occupations = this.occupationService.searchOccupations(request);
        return occupationDto().buildPage(occupations);
    }

    @GetMapping("{id}")
    public Map<String, Object> get(@PathVariable("id") long id) {
        Occupation occupation = this.occupationService.getOccupation(id);
        return occupationDto().build(occupation);
    }

    @PostMapping
    public Map<String, Object> create(@Valid @RequestBody CreateOccupationRequest request) throws EntityExistsException {
        Occupation occupation = this.occupationService.createOccupation(request);
        return occupationDto().build(occupation);
    }

    @PutMapping("{id}")
    public Map<String, Object> update(@PathVariable("id") long id,
                                      @Valid @RequestBody UpdateOccupationRequest request) throws EntityExistsException  {

        Occupation occupation = this.occupationService.updateOccupation(id, request);
        return occupationDto().build(occupation);
    }

    @DeleteMapping("{id}")
    public boolean delete(@PathVariable("id") long id) throws EntityReferencedException {
        return this.occupationService.deleteOccupation(id);
    }

    private DtoBuilder occupationDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                .add("isco08Code")
                .add("status")
                ;
    }

}
