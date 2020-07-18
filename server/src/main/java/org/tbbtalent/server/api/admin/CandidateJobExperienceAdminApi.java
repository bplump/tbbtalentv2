package org.tbbtalent.server.api.admin;

import java.util.Map;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.tbbtalent.server.exception.EntityExistsException;
import org.tbbtalent.server.model.db.CandidateJobExperience;
import org.tbbtalent.server.request.work.experience.CreateJobExperienceRequest;
import org.tbbtalent.server.request.work.experience.SearchJobExperienceRequest;
import org.tbbtalent.server.request.work.experience.UpdateJobExperienceRequest;
import org.tbbtalent.server.service.CandidateJobExperienceService;
import org.tbbtalent.server.util.dto.DtoBuilder;

@RestController()
@RequestMapping("/api/admin/candidate-job-experience")
public class CandidateJobExperienceAdminApi {

    private final CandidateJobExperienceService candidateJobExperienceService;

    @Autowired
    public CandidateJobExperienceAdminApi(CandidateJobExperienceService candidateJobExperienceService) {
        this.candidateJobExperienceService = candidateJobExperienceService;
    }

    @PostMapping("search")
    public Map<String, Object> search(@RequestBody SearchJobExperienceRequest request) {
        Page<CandidateJobExperience> candidateJobExperiences = this.candidateJobExperienceService.searchCandidateJobExperience(request);
        return candidateJobExperienceDto().buildPage(candidateJobExperiences);
    }

    @PostMapping("{id}")
    public Map<String, Object> create(@Valid @PathVariable("id") Long candidateId,
                                      @RequestBody CreateJobExperienceRequest request) throws EntityExistsException {
        request.setCandidateId(candidateId);
        CandidateJobExperience candidateJobExperience = this.candidateJobExperienceService.createCandidateJobExperience(request);
        return candidateJobExperienceDto().build(candidateJobExperience);
    }

    @PutMapping("{id}")
    public Map<String, Object> update(@PathVariable("id") Long id,
                                      @RequestBody UpdateJobExperienceRequest request) {
        CandidateJobExperience candidateJobExperience = this.candidateJobExperienceService.updateCandidateJobExperience(id, request);
        return candidateJobExperienceDto().build(candidateJobExperience);
    }

    @DeleteMapping("{id}")
    public ResponseEntity delete(@PathVariable("id") Long id) {
        candidateJobExperienceService.deleteCandidateJobExperience(id);
        return ResponseEntity.ok().build();
    }

    private DtoBuilder candidateJobExperienceDto() {
        return new DtoBuilder()
                .add("id")
                .add("companyName")
                .add("role")
                .add("startDate")
                .add("endDate")
                .add("fullTime")
                .add("paid")
                .add("description")
                .add("country", countryDto())
                .add("candidateOccupation", candidateOccupationDto())
                ;
    }

    private DtoBuilder countryDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                .add("status")
                ;
    }

    private DtoBuilder candidateOccupationDto() {
        return new DtoBuilder()
                .add("id")
                .add("occupation", occupationDto())
                .add("yearsExperience")
                ;
    }

    private DtoBuilder occupationDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                ;
    }

}
