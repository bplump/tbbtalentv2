package org.tbbtalent.server.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.tbbtalent.server.exception.EntityExistsException;
import org.tbbtalent.server.exception.NoSuchObjectException;
import org.tbbtalent.server.model.*;
import org.tbbtalent.server.repository.*;
import org.tbbtalent.server.request.candidate.SearchCandidateRequest;
import org.tbbtalent.server.request.candidate.SearchJoinRequest;
import org.tbbtalent.server.request.search.SearchSavedSearchRequest;
import org.tbbtalent.server.request.search.UpdateSavedSearchRequest;
import org.tbbtalent.server.security.UserContext;
import org.tbbtalent.server.service.SavedSearchService;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class SavedSearchServiceImpl implements SavedSearchService {

    private static final Logger log = LoggerFactory.getLogger(SavedSearchServiceImpl.class);

    private final CandidateRepository candidateRepository;
    private final SavedSearchRepository savedSearchRepository;
    private final SearchJoinRepository searchJoinRepository;
    private final LanguageLevelRepository languageLevelRepository;
    private final LanguageRepository languageRepository;
    private final CountryRepository countryRepository;
    private final NationalityRepository nationalityRepository;
    private final OccupationRepository occupationRepository;
    private final EducationMajorRepository educationMajorRepository;
    private final EducationLevelRepository educationLevelRepository;
    private final UserContext userContext;

    @Autowired
    public SavedSearchServiceImpl(CandidateRepository candidateRepository, SavedSearchRepository savedSearchRepository,
                                  SearchJoinRepository searchJoinRepository, LanguageLevelRepository languageLevelRepository,
                                  LanguageRepository languageRepository, CountryRepository countryRepository, NationalityRepository nationalityRepository, OccupationRepository occupationRepository, EducationMajorRepository educationMajorRepository, EducationLevelRepository educationLevelRepository, UserContext userContext) {
        this.candidateRepository = candidateRepository;
        this.savedSearchRepository = savedSearchRepository;
        this.searchJoinRepository = searchJoinRepository;
        this.languageLevelRepository = languageLevelRepository;
        this.languageRepository = languageRepository;
        this.countryRepository = countryRepository;
        this.nationalityRepository = nationalityRepository;
        this.occupationRepository = occupationRepository;
        this.educationMajorRepository = educationMajorRepository;
        this.educationLevelRepository = educationLevelRepository;
        this.userContext = userContext;
    }

    @Override
    public Page<SavedSearch> searchSavedSearches(SearchSavedSearchRequest request) {
        Page<SavedSearch> savedSearches = savedSearchRepository.findAll(
                SavedSearchSpecification.buildSearchQuery(request), request.getPageRequest());
        log.info("Found " + savedSearches.getTotalElements() + " savedSearches in search");

        for (SavedSearch savedSearch: savedSearches) {
            savedSearch.parseType();
        }
        
        return savedSearches;
    }

    @Override
    public SearchCandidateRequest loadSavedSearch(long id) {
        SavedSearch savedSearch = this.savedSearchRepository.findByIdLoadSearchJoins(id)
                .orElseThrow(() -> new NoSuchObjectException(SavedSearch.class, id));
        savedSearch.parseType();
        return convertToSearchCandidateRequest(savedSearch);
    }

    @Override
    public SavedSearch getSavedSearch(long id) {
        SavedSearch savedSearch = this.savedSearchRepository.findById(id)
                .orElseThrow(() -> new NoSuchObjectException(SavedSearch.class, id));

        savedSearch.parseType();

        Map<Integer, String> languageLevelMap = languageLevelRepository.findAllActive().stream().collect(
                Collectors.toMap(LanguageLevel::getLevel, LanguageLevel::getName, (l1, l2) ->  l1));
        Map<Integer, String> educationLevelMap = educationLevelRepository.findAllActive().stream().collect(
                Collectors.toMap(EducationLevel::getLevel, EducationLevel::getName, (l1, l2) ->  l1));

        if (!StringUtils.isEmpty(savedSearch.getCountryIds())){
            savedSearch.setCountryNames(countryRepository.getNamesForIds(getIdsFromString(savedSearch.getCountryIds())));
        }
        if (!StringUtils.isEmpty(savedSearch.getNationalityIds())){
            savedSearch.setNationalityNames(nationalityRepository.getNamesForIds(getIdsFromString(savedSearch.getNationalityIds())));
        }
        if (!StringUtils.isEmpty(savedSearch.getOccupationIds())){
            savedSearch.setOccupationNames(occupationRepository.getNamesForIds(getIdsFromString(savedSearch.getOccupationIds())));
        }
        if (!StringUtils.isEmpty(savedSearch.getVerifiedOccupationIds())){
            savedSearch.setVettedOccupationNames(occupationRepository.getNamesForIds(getIdsFromString(savedSearch.getVerifiedOccupationIds())));
        }
        if (!StringUtils.isEmpty(savedSearch.getEducationMajorIds())){
            savedSearch.setEducationMajors(educationMajorRepository.getNamesForIds(getIdsFromString(savedSearch.getEducationMajorIds())));
        }
        if (savedSearch.getEnglishMinWrittenLevel() != null){
            savedSearch.setEnglishWrittenLevel(languageLevelMap.get(savedSearch.getEnglishMinWrittenLevel()));
        }
        if (savedSearch.getEnglishMinSpokenLevel() != null){
            savedSearch.setEnglishSpokenLevel(languageLevelMap.get(savedSearch.getEnglishMinSpokenLevel()));
        }
        if (savedSearch.getOtherMinSpokenLevel() != null){
            savedSearch.setOtherSpokenLevel(languageLevelMap.get(savedSearch.getOtherMinSpokenLevel()));
        }
        if (savedSearch.getOtherMinWrittenLevel() != null){
            savedSearch.setOtherWrittenLevel(languageLevelMap.get(savedSearch.getOtherMinWrittenLevel()));
        }
        if (savedSearch.getMinEducationLevel() != null){
            savedSearch.setMinEducationLevelName(educationLevelMap.get(savedSearch.getMinEducationLevel()));
        }
        return savedSearch;

    }

    @Override
    @Transactional
    public SavedSearch createSavedSearch(UpdateSavedSearchRequest request) throws EntityExistsException {
        SavedSearch savedSearch = convertToSavedSearch(request);
        checkDuplicates(null, request.getName());
        savedSearch.setAuditFields(userContext.getLoggedInUser());
        savedSearch = this.savedSearchRepository.save(savedSearch);
        savedSearch = addSearchJoins(request, savedSearch);
        return savedSearch;
    }

    @Override
    @Transactional
    public SavedSearch updateSavedSearch(long id, UpdateSavedSearchRequest request) throws EntityExistsException {
        // if no search candidate request, only update the search name and type
        if(request.getSearchCandidateRequest() == null){
            SavedSearch savedSearch = savedSearchRepository.findById(id).orElse(null);
            savedSearch.setName(request.getName());
            savedSearch.setType(request.getSavedSearchType(), request.getSavedSearchSubtype());
            return savedSearchRepository.save(savedSearch);
        }

        SavedSearch savedSearch = convertToSavedSearch(request);
        //delete and recreate all joined searches
        searchJoinRepository.deleteBySearchId(id);

        savedSearch = addSearchJoins(request, savedSearch);
        savedSearch.setId(id);
        savedSearch.setAuditFields(userContext.getLoggedInUser());
        checkDuplicates(id, request.getName());
        return savedSearchRepository.save(savedSearch);
    }

    @Override
    @Transactional
    public boolean deleteSavedSearch(long id)  {
        SavedSearch savedSearch = savedSearchRepository.findById(id).orElse(null);

        if (savedSearch != null) {
            savedSearch.setStatus(Status.deleted);
            //Change name so that that name can be reused
            savedSearch.setName("__deleted__" + savedSearch.getName());
            savedSearchRepository.save(savedSearch);
            return true;
        }
        return false;
    }

    private void checkDuplicates(Long id, String name) {
        SavedSearch existing = savedSearchRepository.findByNameIgnoreCase(name);
        if (existing != null && existing.getStatus() != Status.deleted) {
            if (!existing.getId().equals(id)) {
                throw new EntityExistsException("savedSearch");
            }
        }
    }

    private SavedSearch addSearchJoins(UpdateSavedSearchRequest request, SavedSearch savedSearch) {
        Set<SearchJoin> searchJoins = new HashSet<>();
        if (!CollectionUtils.isEmpty(request.getSearchCandidateRequest().getSearchJoinRequests())){
            for (SearchJoinRequest searchJoinRequest : request.getSearchCandidateRequest().getSearchJoinRequests()) {
                SearchJoin searchJoin = new SearchJoin();
                searchJoin.setSavedSearch(savedSearch);
                searchJoin.setChildSavedSearch(savedSearchRepository.findById(searchJoinRequest.getSavedSearchId()).orElseThrow(() -> new NoSuchObjectException(SavedSearch.class, searchJoinRequest.getSavedSearchId())));
                searchJoin.setSearchType(searchJoinRequest.getSearchType());
                this.searchJoinRepository.save(searchJoin);
            }
            savedSearch.setSearchJoins(searchJoins);
        }

        return savedSearch;
    }


    //---------------------------------------------------------------------------------------------------
    private SavedSearch convertToSavedSearch(UpdateSavedSearchRequest request) {


        SavedSearch savedSearch = new SavedSearch();
        savedSearch.setName(request.getName());
        savedSearch.setType(request.getSavedSearchType(), request.getSavedSearchSubtype());

        final SearchCandidateRequest searchCandidateRequest = request.getSearchCandidateRequest();
        if (searchCandidateRequest != null) {
            savedSearch.setKeyword(searchCandidateRequest.getKeyword());
            savedSearch.setStatuses(getStatusListAsString(searchCandidateRequest.getStatuses()));
            savedSearch.setGender(searchCandidateRequest.getGender());
            savedSearch.setOccupationIds(getListAsString(searchCandidateRequest.getOccupationIds()));
            savedSearch.setOrProfileKeyword(searchCandidateRequest.getOrProfileKeyword());
            savedSearch.setVerifiedOccupationIds(getListAsString(searchCandidateRequest.getVerifiedOccupationIds()));
            savedSearch.setVerifiedOccupationSearchType(searchCandidateRequest.getVerifiedOccupationSearchType());
            savedSearch.setNationalityIds(getListAsString(searchCandidateRequest.getNationalityIds()));
            savedSearch.setNationalitySearchType(searchCandidateRequest.getNationalitySearchType());
            savedSearch.setCountryIds(getListAsString(searchCandidateRequest.getCountryIds()));
            savedSearch.setEnglishMinSpokenLevel(searchCandidateRequest.getEnglishMinSpokenLevel());
            savedSearch.setEnglishMinWrittenLevel(searchCandidateRequest.getEnglishMinWrittenLevel());
            Optional<Language> language = searchCandidateRequest.getOtherLanguageId() != null ? languageRepository.findById(searchCandidateRequest.getOtherLanguageId()) : null;
            if (language != null && language.isPresent()) {
                savedSearch.setOtherLanguage(language.get());
            }
            savedSearch.setOtherMinSpokenLevel(searchCandidateRequest.getOtherMinSpokenLevel());
            savedSearch.setOtherMinWrittenLevel(searchCandidateRequest.getOtherMinWrittenLevel());
            savedSearch.setUnRegistered(searchCandidateRequest.getUnRegistered());
            savedSearch.setLastModifiedFrom(searchCandidateRequest.getLastModifiedFrom());
            savedSearch.setLastModifiedTo(searchCandidateRequest.getLastModifiedTo());
//        savedSearch.setCreatedFrom(request.getSearchCandidateRequest().getRegisteredFrom());
//        savedSearch.setCreatedTo(request.getSearchCandidateRequest().getRegisteredTo());
            savedSearch.setMinAge(searchCandidateRequest.getMinAge());
            savedSearch.setMaxAge(searchCandidateRequest.getMaxAge());
            savedSearch.setMinEducationLevel(searchCandidateRequest.getMinEducationLevel());
            savedSearch.setEducationMajorIds(getListAsString(searchCandidateRequest.getEducationMajorIds()));
            savedSearch.setIncludeDraftAndDeleted(searchCandidateRequest.getIncludeDraftAndDeleted());
        }

        return savedSearch;

    }

    private SearchCandidateRequest convertToSearchCandidateRequest(SavedSearch request) {
        SearchCandidateRequest searchCandidateRequest = new SearchCandidateRequest();
        searchCandidateRequest.setSavedSearchId(request.getId());
        searchCandidateRequest.setKeyword(request.getKeyword());
        searchCandidateRequest.setStatuses(getStatusListFromString(request.getStatuses()));
        searchCandidateRequest.setGender(request.getGender());
        searchCandidateRequest.setOccupationIds(getIdsFromString(request.getOccupationIds()));
        searchCandidateRequest.setOrProfileKeyword(request.getOrProfileKeyword());
        searchCandidateRequest.setVerifiedOccupationIds(getIdsFromString(request.getVerifiedOccupationIds()));
        searchCandidateRequest.setVerifiedOccupationSearchType(request.getVerifiedOccupationSearchType());
        searchCandidateRequest.setNationalityIds(getIdsFromString(request.getNationalityIds()));
        searchCandidateRequest.setNationalitySearchType(request.getNationalitySearchType());
        searchCandidateRequest.setCountryIds(getIdsFromString(request.getCountryIds()));
        searchCandidateRequest.setEnglishMinSpokenLevel(request.getEnglishMinSpokenLevel());
        searchCandidateRequest.setEnglishMinWrittenLevel(request.getEnglishMinWrittenLevel());
        searchCandidateRequest.setOtherLanguageId(request.getOtherLanguage() != null ? request.getOtherLanguage().getId() : null);
        searchCandidateRequest.setOtherMinSpokenLevel(request.getOtherMinSpokenLevel());
        searchCandidateRequest.setOtherMinWrittenLevel(request.getOtherMinWrittenLevel());
        searchCandidateRequest.setUnRegistered(request.isUnRegistered());
        searchCandidateRequest.setLastModifiedFrom(request.getLastModifiedFrom());
        searchCandidateRequest.setLastModifiedTo(request.getLastModifiedTo());
//        searchCandidateRequest.setRegisteredFrom(request.getCreatedFrom());
//        searchCandidateRequest.setRegisteredTo(request.getCreatedTo());
        searchCandidateRequest.setMinAge(request.getMinAge());
        searchCandidateRequest.setMaxAge(request.getMaxAge());
        searchCandidateRequest.setMinEducationLevel(request.getMinEducationLevel());
        searchCandidateRequest.setEducationMajorIds(getIdsFromString(request.getEducationMajorIds()));
        searchCandidateRequest.setIncludeDraftAndDeleted(request.getIncludeDraftAndDeleted());
        List<SearchJoinRequest> searchJoinRequests = new ArrayList<>();
        for (SearchJoin searchJoin : request.getSearchJoins()) {
            searchJoinRequests.add(new SearchJoinRequest(searchJoin.getChildSavedSearch().getId(), searchJoin.getChildSavedSearch().getName(), searchJoin.getSearchType()));
        }
        searchCandidateRequest.setSearchJoinRequests(searchJoinRequests);

        return searchCandidateRequest;

    }



    String getListAsString(List<Long> ids){
        return !CollectionUtils.isEmpty(ids) ? ids.stream().map(String::valueOf)
                .collect(Collectors.joining(",")) : null;
    }

    List<Long> getIdsFromString(String listIds){
        return listIds != null ? Stream.of(listIds.split(","))
                .map(Long::parseLong)
                .collect(Collectors.toList()) : null;
    }

    String getStatusListAsString(List<CandidateStatus> statuses){
        return !CollectionUtils.isEmpty(statuses) ? statuses.stream().map(String::valueOf)
                .collect(Collectors.joining(",")) : null;
    }

    List<CandidateStatus> getStatusListFromString(String statusList){
        return statusList != null ? Stream.of(statusList.split(","))
                .map(s -> CandidateStatus.valueOf(s))
                .collect(Collectors.toList()) : null;
    }
}
