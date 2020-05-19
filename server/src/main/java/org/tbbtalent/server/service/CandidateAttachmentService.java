package org.tbbtalent.server.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.tbbtalent.server.model.CandidateAttachment;
import org.tbbtalent.server.request.PagedSearchRequest;
import org.tbbtalent.server.request.attachment.CreateCandidateAttachmentRequest;
import org.tbbtalent.server.request.attachment.SearchCandidateAttachmentsRequest;
import org.tbbtalent.server.request.attachment.UpdateCandidateAttachmentRequest;

public interface CandidateAttachmentService {

    Page<CandidateAttachment> searchCandidateAttachments(SearchCandidateAttachmentsRequest request);

    Page<CandidateAttachment> searchCandidateAttachmentsForLoggedInCandidate(PagedSearchRequest request);

    List<CandidateAttachment> listCandidateAttachmentsForLoggedInCandidate();

    CandidateAttachment createCandidateAttachment(CreateCandidateAttachmentRequest request, Boolean adminOnly);

    void deleteCandidateAttachment(Long id);

    CandidateAttachment updateCandidateAttachment(UpdateCandidateAttachmentRequest request);
}
