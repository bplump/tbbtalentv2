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

import {BrowserModule, Title} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {NgbDateAdapter, NgbDateParserFormatter, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgMultiSelectDropDownModule} from 'ng-multiselect-dropdown';
import {RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module} from 'ng-recaptcha';
import {DatePipe, TitleCasePipe} from '@angular/common';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './components/app.component';
import {HeaderComponent} from './components/header/header.component';
import {ShowCandidatesComponent} from './components/candidates/show/show-candidates.component';
import {HomeComponent} from './components/candidates/home.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ViewCandidateComponent} from './components/candidates/view/view-candidate.component';
import {EditCandidateStatusComponent} from './components/candidates/view/status/edit-candidate-status.component';
import {DeleteCandidateComponent} from './components/candidates/view/delete/delete-candidate.component';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {JwtInterceptor} from './services/jwt.interceptor';
import {ErrorInterceptor} from './services/error.interceptor';
import {AuthService} from './services/auth.service';
import {LocalStorageModule} from 'angular-2-local-storage';
import {LoginComponent} from './components/login/login.component';
import {SettingsComponent} from './components/settings/settings.component';
import {SearchUsersComponent} from './components/settings/users/search-users.component';
import {ConfirmationComponent} from './components/util/confirm/confirmation.component';
import {SearchCountriesComponent} from './components/settings/countries/search-countries.component';
import {CreateCountryComponent} from './components/settings/countries/create/create-country.component';
import {EditCountryComponent} from './components/settings/countries/edit/edit-country.component';
import {SearchLanguagesComponent} from './components/settings/languages/search-languages.component';
import {CreateLanguageComponent} from './components/settings/languages/create/create-language.component';
import {EditLanguageComponent} from './components/settings/languages/edit/edit-language.component';
import {SearchSavedSearchesComponent} from './components/search/load-search/search-saved-searches.component';
import {CreateUpdateSearchComponent} from './components/search/create-update/create-update-search.component';
import {CandidateSearchCardComponent} from './components/util/candidate-search-card/candidate-search-card.component';
import {CandidateGeneralTabComponent} from './components/candidates/view/tab/candidate-general-tab/candidate-general-tab.component';
import {CandidateExperienceTabComponent} from './components/candidates/view/tab/candidate-experience-tab/candidate-experience-tab.component';
import {CandidateHistoryTabComponent} from './components/candidates/view/tab/candidate-history-tab/candidate-history-tab.component';
import {CandidateEligibilityTabComponent} from './components/candidates/view/tab/candidate-eligibility-tab/candidate-eligibility-tab.component';
import {SearchOccupationsComponent} from './components/settings/occupations/search-occupations.component';
import {CreateOccupationComponent} from './components/settings/occupations/create/create-occupation.component';
import {EditOccupationComponent} from './components/settings/occupations/edit/edit-occupation.component';
import {SearchIndustriesComponent} from './components/settings/industries/search-industries.component';
import {CreateIndustryComponent} from './components/settings/industries/create/create-industry.component';
import {EditIndustryComponent} from './components/settings/industries/edit/edit-industry.component';
import {SearchLanguageLevelsComponent} from './components/settings/language-levels/search-language-levels.component';
import {CreateLanguageLevelComponent} from './components/settings/language-levels/create/create-language-level.component';
import {EditLanguageLevelComponent} from './components/settings/language-levels/edit/edit-language-level.component';
import {SearchEducationLevelsComponent} from './components/settings/education-levels/search-education-levels.component';
import {CreateEducationLevelComponent} from './components/settings/education-levels/create/create-education-level.component';
import {EditEducationLevelComponent} from './components/settings/education-levels/edit/edit-education-level.component';
import {SearchEducationMajorsComponent} from './components/settings/education-majors/search-education-majors.component';
import {CreateEducationMajorComponent} from './components/settings/education-majors/create/create-education-major.component';
import {EditEducationMajorComponent} from './components/settings/education-majors/edit/edit-education-major.component';
import {DropdownTranslationsComponent} from './components/settings/translations/dropdowns/dropdown-translations.component';

import {ViewCandidateContactComponent} from './components/candidates/view/contact/view-candidate-contact.component';
import {ViewCandidateLanguageComponent} from './components/candidates/view/language/view-candidate-language.component';
import {EditCandidateContactComponent} from './components/candidates/view/contact/edit/edit-candidate-contact.component';

import {ViewCandidateNoteComponent} from './components/candidates/view/note/view-candidate-note.component';
import {CreateCandidateNoteComponent} from './components/candidates/view/note/create/create-candidate-note.component';
import {EditCandidateNoteComponent} from './components/candidates/view/note/edit/edit-candidate-note.component';

import {ViewCandidateEducationComponent} from './components/candidates/view/education/view-candidate-education.component';
import {CreateCandidateEducationComponent} from './components/candidates/view/education/create/create-candidate-education.component';
import {EditCandidateEducationComponent} from './components/candidates/view/education/edit/edit-candidate-education.component';

import {ViewCandidateCertificationComponent} from './components/candidates/view/certification/view-candidate-certification.component';
import {CreateCandidateCertificationComponent} from './components/candidates/view/certification/create/create-candidate-certification.component';
import {EditCandidateCertificationComponent} from './components/candidates/view/certification/edit/edit-candidate-certification.component';
import {ViewCandidateOccupationComponent} from './components/candidates/view/occupation/view-candidate-occupation.component';
import {ViewCandidateJobExperienceComponent} from './components/candidates/view/occupation/experience/view-candidate-job-experience.component';
import {CreateUpdateUserComponent} from './components/settings/users/create-update-user/create-update-user.component';
import {CandidateEducationTabComponent} from './components/candidates/view/tab/candidate-education-tab/candidate-education-tab.component';
import {JoinSavedSearchComponent} from './components/search/join-search/join-saved-search.component';
import {CandidateSourceComponent} from './components/util/candidate-source/candidate-source.component';
import {LanguageLevelFormControlComponent} from './components/util/form/language-proficiency/language-level-form-control.component';
import {CandidatePipe} from './pipes/candidate.pipe';
import {EditCandidateReviewStatusItemComponent} from './components/util/candidate-review/edit/edit-candidate-review-status-item.component';
import {CandidateReviewStatusItemComponent} from './components/util/candidate-review/candidate-review-status-item.component';
import {UserPipe} from './components/util/user/user.pipe';
import {UpdatedByComponent} from './components/util/user/updated-by/updated-by.component';
import {DateRangePickerComponent} from './components/util/form/date-range-picker/date-range-picker.component';
import {EditCandidateJobExperienceComponent} from './components/candidates/view/occupation/experience/edit/edit-candidate-job-experience.component';
import {CreateCandidateJobExperienceComponent} from './components/candidates/view/occupation/experience/create/create-candidate-job-experience.component';
import {ViewCandidateAttachmentComponent} from './components/candidates/view/attachment/view-candidate-attachment.component';
import {EditCandidateOccupationComponent} from './components/candidates/view/occupation/edit/edit-candidate-occupation.component';
import {SortedByComponent} from './components/util/sort/sorted-by.component';
import {EditCandidateLanguageComponent} from './components/candidates/view/language/edit/edit-candidate-language.component';
import {ViewCandidateAccountComponent} from './components/candidates/view/account/view-candidate-account.component';
import {ChangePasswordComponent} from './components/account/change-password/change-password.component';
import {CreateCandidateAttachmentComponent} from './components/candidates/view/attachment/create/create-candidate-attachment.component';
import {EditCandidateAttachmentComponent} from './components/candidates/view/attachment/edit/edit-candidate-attachment.component';
import {FileUploadComponent} from './components/util/file-upload/file-upload.component';
import {CandidateAdditionalInfoTabComponent} from './components/candidates/view/tab/candidate-additional-info-tab/candidate-additional-info-tab.component';
import {ViewCandidateAdditionalInfoComponent} from './components/candidates/view/additional-info/view-candidate-additional-info.component';
import {ViewCandidateSkillComponent} from './components/candidates/view/skill/view-candidate-skill.component';
import {BrowseCandidateSourcesComponent} from './components/candidates/show/browse/browse-candidate-sources.component';
import {ChartsModule} from 'ng2-charts';
import {InfographicComponent} from './components/infographics/infographic.component';
import {ChartComponent} from './components/infographics/chart/chart.component';
import {MonthPickerComponent} from './components/util/month-picker/month-picker.component';
import {CandidateSourceResultsComponent} from './components/candidates/show/returns/candidate-source-results.component';
import {DefineSearchComponent} from './components/search/define-search/define-search.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {GeneralTranslationsComponent} from './components/settings/translations/general/general-translations.component';
import {ViewCandidateSpecialLinksComponent} from './components/candidates/view/special-links/view-candidate-special-links.component';
import {EditCandidateSpecialLinksComponent} from './components/candidates/view/special-links/edit/edit-candidate-special-links.component';
import {NgxWigModule} from 'ngx-wig';
import {ViewCandidateSurveyComponent} from './components/candidates/view/survey/view-candidate-survey.component';
import {EditCandidateAdditionalInfoComponent} from './components/candidates/view/additional-info/edit/edit-candidate-additional-info.component';
import {EditCandidateSurveyComponent} from './components/candidates/view/survey/edit/edit-candidate-survey.component';
import {CreateUpdateListComponent} from './components/list/create-update/create-update-list.component';
import {SelectListComponent} from './components/list/select/select-list.component';
import {CandidatesSearchComponent} from './components/candidates/candidates-search/candidates-search.component';
import {CandidatesListComponent} from './components/candidates/candidates-list/candidates-list.component';
import {CreateCandidateOccupationComponent} from './components/candidates/view/occupation/create/create-candidate-occupation.component';
import {CvIconComponent} from './components/util/cv-icon/cv-icon.component';
import {JoblinkComponent} from './components/util/joblink/joblink.component';
import {CandidateContextNoteComponent} from './components/util/candidate-context-note/candidate-context-note.component';
import {ReturnedHomeComponent} from './components/candidates/intake/returned-home/returned-home.component';
import {CandidateIntakeTabComponent} from './components/candidates/view/tab/candidate-intake-tab/candidate-intake-tab.component';
import {VisaIssuesComponent} from './components/candidates/intake/visa-issues/visa-issues.component';
import {CitizenshipsComponent} from './components/candidates/intake/citizenships/citizenships.component';
import {CandidateCitizenshipCardComponent} from './components/candidates/intake/citizenships/card/candidate-citizenship-card.component';
import {AvailImmediateComponent} from './components/candidates/intake/avail-immediate/avail-immediate.component';
import {FamilyComponent} from './components/candidates/intake/family/family.component';
import {CandidateMiniIntakeTabComponent} from './components/candidates/view/tab/candidate-mini-intake-tab/candidate-mini-intake-tab.component';
import {IntRecruitmentComponent} from './components/candidates/intake/int-recruitment/int-recruitment.component';
import {RuralComponent} from './components/candidates/intake/rural/rural.component';
import {ReturnHomeSafeComponent} from './components/candidates/intake/return-home-safe/return-home-safe.component';
import {WorkPermitComponent} from './components/candidates/intake/work-permit/work-permit.component';
import {WorkLegallyComponent} from './components/candidates/intake/work-legally/work-legally.component';
import {WorkStatusComponent} from './components/candidates/intake/work-status/work-status.component';
import {HostEntryComponent} from './components/candidates/intake/host-entry/host-entry.component';
import {CandidateVisaTabComponent} from './components/candidates/view/tab/candidate-visa-tab/candidate-visa-tab.component';
import {CustomDateAdapter, CustomDateParserFormatter} from './util/date-adapter/ngb-date-adapter';
import {RegistrationUnhcrComponent} from './components/candidates/intake/registration-unhcr/registration-unhcr.component';
import {RegistrationUnrwaComponent} from './components/candidates/intake/registration-unrwa/registration-unrwa.component';
import {HomeLocationComponent} from './components/candidates/intake/home-location/home-location.component';
import {AsylumYearComponent} from './components/candidates/intake/asylum-year/asylum-year.component';
import {DestinationComponent} from './components/candidates/intake/destinations/destination/destination.component';
import {DestinationsComponent} from './components/candidates/intake/destinations/destinations.component';
import {VisaAssessmentComponent} from './components/candidates/intake/visa-assessment/visa-assessment.component';
import {VisaCheckAuComponent} from './components/candidates/view/tab/candidate-visa-tab/au/visa-check-au.component';
import {VisaCheckCaComponent} from './components/candidates/view/tab/candidate-visa-tab/ca/visa-check-ca.component';
import {VisaCheckNzComponent} from './components/candidates/view/tab/candidate-visa-tab/nz/visa-check-nz.component';
import {VisaCheckUkComponent} from './components/candidates/view/tab/candidate-visa-tab/uk/visa-check-uk.component';
import {DestinationLimitComponent} from './components/candidates/intake/destination-limit/destination-limit.component';
import {FixedInputComponent} from './components/util/intake/fixed-input/fixed-input.component';
import {ConfirmContactComponent} from './components/candidates/intake/confirm-contact/confirm-contact.component';
import {ExamsComponent} from './components/candidates/intake/exams/exams.component';
import {CandidateExamCardComponent} from './components/candidates/intake/exams/card/candidate-exam-card.component';
import {HasNameSelectorComponent} from './components/util/has-name-selector/has-name-selector.component';
import {DestinationJobComponent} from './components/candidates/intake/destination-job/destination-job.component';
import {CrimeComponent} from './components/candidates/intake/crime/crime.component';
import {ConflictComponent} from './components/candidates/intake/conflict/conflict.component';
import {ResidenceStatusComponent} from './components/candidates/intake/residence-status/residence-status.component';
import {WorkAbroadComponent} from './components/candidates/intake/work-abroad/work-abroad.component';
import {HostEntryLegallyComponent} from './components/candidates/intake/host-entry-legally/host-entry-legally.component';
import {LeftHomeReasonComponent} from './components/candidates/intake/left-home-reasons/left-home-reason.component';
import {ReturnHomeFutureComponent} from './components/candidates/intake/return-home-future/return-home-future.component';
import {ResettlementThirdComponent} from './components/candidates/intake/resettlement-third/resettlement-third.component';
import {HostChallengesComponent} from './components/candidates/intake/host-challenges/host-challenges.component';
import {MaritalStatusComponent} from './components/candidates/intake/marital-status/marital-status.component';
import {AutosaveStatusComponent} from './components/util/autosave-status/autosave-status.component';
import {DragulaModule} from 'ng2-dragula';
import {CandidateColumnSelectorComponent} from './components/util/candidate-column-selector/candidate-column-selector.component';
import {CandidateNameNumSearchComponent} from './components/util/candidate-name-num-search/candidate-name-num-search.component';
import {MilitaryServiceComponent} from './components/candidates/intake/military-service/military-service.component';
import {VisaRejectComponent} from './components/candidates/intake/visa-reject/visa-reject.component';
import {DrivingLicenseComponent} from './components/candidates/intake/driving-license/driving-license.component';
import {DependantsComponent} from './components/candidates/intake/dependants/dependants.component';
import {DependantsCardComponent} from './components/candidates/intake/dependants/card/dependants-card.component';
import {LangAssessmentComponent} from './components/candidates/intake/lang-assessment/lang-assessment.component';
import {ExtendDatePipe} from './util/date-adapter/extend-date-pipe';
import {DatePickerComponent} from './components/util/date-picker/date-picker.component';
import {IntProtectionComponent} from "./components/candidates/visa/int-protection/int-protection.component";
import {CharacterAssessmentComponent} from "./components/candidates/visa/character-assessment/character-assessment.component";
import {SecurityRiskComponent} from "./components/candidates/visa/security-risk/security-risk.component";
import {TravelDocumentComponent} from "./components/candidates/visa/travel-document/travel-document.component";
import {CreateVisaJobAssessementComponent} from "./components/candidates/visa/visa-job-assessments/modal/create-visa-job-assessement.component";
import {SalaryTsmitComponent} from "./components/candidates/visa/visa-job-assessments/salary-tsmit/salary-tsmit.component";
import {RegionalAreaComponent} from "./components/candidates/visa/visa-job-assessments/regional-area/regional-area.component";
import {JobInterestComponent} from "./components/candidates/visa/visa-job-assessments/job-interest/job-interest.component";
import {JobFamilyAusComponent} from "./components/candidates/visa/visa-job-assessments/job-family-aus/job-family-aus.component";
import {JobEligibilityAssessmentComponent} from "./components/candidates/visa/visa-job-assessments/job-eligibility-assessment/job-eligibility-assessment.component";
import {VisaFourNineFourComponent} from "./components/candidates/visa/visa-job-assessments/visa-four-nine-four/visa-four-nine-four.component";
import {VisaOneEightSixComponent} from "./components/candidates/visa/visa-job-assessments/visa-one-eight-six/visa-one-eight-six.component";
import {VisaOtherOptionsComponent} from "./components/candidates/visa/visa-job-assessments/visa-other-options/visa-other-options.component";
import {YearsRelevantExpComponent} from "./components/candidates/visa/visa-job-assessments/years-relevant-exp/years-relevant-exp.component";
import {IeltsLevelComponent} from "./components/candidates/visa/visa-job-assessments/ielts-level/ielts-level.component";
import {QualificationRelevantComponent} from "./components/candidates/visa/visa-job-assessments/qualification-relevant/qualification-relevant.component";
import {VisaFinalAssessmentComponent} from "./components/candidates/visa/visa-job-assessments/visa-final-assessment/visa-final-assessment.component";
import {JobOccupationComponent} from "./components/candidates/visa/visa-job-assessments/job-occupation/job-occupation.component";
import {RiskAssessmentComponent} from "./components/candidates/visa/risk-assessment/risk-assessment.component";
import {HealthAssessmentComponent} from "./components/candidates/visa/health-assessment/health-assessment.component";
import {ShowQrCodeComponent} from './components/util/qr/show-qr-code/show-qr-code.component';
import {HealthIssuesComponent} from './components/candidates/intake/health-issues/health-issues.component';
import {VisaJobPutForwardComponent} from './components/candidates/visa/visa-job-assessments/put-forward/visa-job-put-forward.component';
import {VisaJobNotesComponent} from './components/candidates/visa/visa-job-assessments/visa-job-notes/visa-job-notes.component';
import {VisaJobCheckAuComponent} from './components/candidates/view/tab/candidate-visa-tab/au/job/visa-job-check-au.component';
import {CandidateStatusSelectorComponent} from './components/util/candidate-status-selector/candidate-status-selector.component';
import {FinalAgreementComponent} from './components/candidates/intake/final-agreement/final-agreement.component';
import {NgSelectModule} from "@ng-select/ng-select";
import {CreateCandidateLanguageComponent} from './components/candidates/view/language/create/create-candidate-language.component';
import {SalesforceStageComponent} from './components/util/salesforce-stage/salesforce-stage.component';
import {IeltsScoreValidationComponent} from './components/util/ielts-score-validation/ielts-score-validation.component';
import {FileSelectorComponent} from './components/util/file-selector/file-selector.component';
import {NewJobComponent} from './components/job/new-job/new-job.component';
import {OldIntakeInputComponent} from './components/util/old-intake-input-modal/old-intake-input.component';
import {CandidateShareableNotesComponent} from './components/util/candidate-shareable-notes/candidate-shareable-notes.component';
import {ShareableDocsComponent} from './components/candidates/view/shareable-docs/shareable-docs.component';
import {PublishedDocColumnSelectorComponent} from "./components/util/published-doc-column-selector/published-doc-column-selector.component";
import {CandidateSourceDescriptionComponent} from './components/util/candidate-source-description/candidate-source-description.component';
import {SearchExternalLinksComponent} from './components/settings/external-links/search-external-links.component';
import {CreateExternalLinkComponent} from './components/settings/external-links/create/create-external-link.component';
import {EditExternalLinkComponent} from './components/settings/external-links/edit/edit-external-link.component';
import {CovidVaccinationComponent} from './components/candidates/intake/vaccination/covid-vaccination.component';
import {EnglishThresholdComponent} from './components/candidates/visa/english-threshold/english-threshold.component';
import {FilterPipe} from "./pipes/filter.pipe";
import {CandidateTaskTabComponent} from './components/candidates/view/tab/candidate-task-tab/candidate-task-tab.component';
import {DownloadCvComponent} from './components/util/download-cv/download-cv.component';
import {AssignTasksListComponent} from './components/tasks/assign-tasks-list/assign-tasks-list.component';
import {AssignTasksCandidateComponent} from './components/tasks/assign-tasks-candidate/assign-tasks-candidate.component';
import {EditTaskAssignmentComponent} from './components/candidates/view/tasks/edit/edit-task-assignment.component';
import {ViewCandidateTasksComponent} from "./components/candidates/view/tasks/view-candidate-tasks.component";
import {BrowseTasksComponent} from './components/tasks/browse-tasks/browse-tasks.component';
import {ViewTaskDetailsComponent} from './components/tasks/view-task-details/view-task-details.component';
import {SearchTasksComponent} from './components/settings/tasks/search-tasks.component';
import {TasksMonitorComponent} from './components/util/tasks-monitor/tasks-monitor.component';
import {ViewCandidateMediaWillingnessComponent} from './components/candidates/view/media/view-candidate-media-willingness.component';
import {EditCandidateMediaWillingnessComponent} from './components/candidates/view/media/edit/edit-candidate-media-willingness.component';
import {ViewResponseComponent} from './components/candidates/view/tasks/view-response/view-response.component';
import {ViewCandidateRegistrationComponent} from './components/candidates/view/registration/view-candidate-registration.component';
import {EditCandidateRegistrationComponent} from './components/candidates/view/registration/edit/edit-candidate-registration.component';
import {EditTaskComponent} from './components/settings/tasks/edit/edit-task.component';
import {TasksMonitorListComponent} from './components/util/tasks-monitor-list/tasks-monitor-list.component';
import {SearchPartnersComponent} from './components/settings/partners/search-partners/search-partners.component';
import {CreateUpdatePartnerComponent} from './components/settings/partners/create-update-partner/create-update-partner.component';
import {RoleGuardService} from "./services/role-guard.service";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    ConfirmationComponent,
    HomeComponent,
    ViewCandidateComponent,
    EditCandidateStatusComponent,
    DeleteCandidateComponent,
    SettingsComponent,
    SearchUsersComponent,
    SearchCountriesComponent,
    CreateCountryComponent,
    EditCountryComponent,
    SearchLanguagesComponent,
    CreateLanguageComponent,
    EditLanguageComponent,
    SearchSavedSearchesComponent,
    CreateUpdateSearchComponent,
    CandidateSearchCardComponent,
    CandidateGeneralTabComponent,
    CandidateExperienceTabComponent,
    CandidateHistoryTabComponent,
    CandidateEducationTabComponent,
    CandidateEligibilityTabComponent,
    SearchOccupationsComponent,
    CreateOccupationComponent,
    EditOccupationComponent,
    SearchIndustriesComponent,
    CreateIndustryComponent,
    EditIndustryComponent,
    SearchLanguageLevelsComponent,
    CreateLanguageLevelComponent,
    EditLanguageLevelComponent,
    SearchEducationLevelsComponent,
    CreateEducationLevelComponent,
    EditEducationLevelComponent,
    SearchEducationMajorsComponent,
    CreateEducationMajorComponent,
    EditEducationMajorComponent,
    CreateUpdateUserComponent,
    EditEducationMajorComponent,
    ViewCandidateContactComponent,
    EditCandidateContactComponent,
    ViewCandidateLanguageComponent,
    ViewCandidateNoteComponent,
    ViewCandidateAttachmentComponent,
    CreateCandidateNoteComponent,
    EditCandidateNoteComponent,
    ViewCandidateEducationComponent,
    CreateCandidateEducationComponent,
    EditCandidateEducationComponent,
    ViewCandidateCertificationComponent,
    CreateCandidateCertificationComponent,
    EditCandidateCertificationComponent,
    JoinSavedSearchComponent,
    CandidateReviewStatusItemComponent,
    EditCandidateReviewStatusItemComponent,
    DateRangePickerComponent,
    DropdownTranslationsComponent,
    LanguageLevelFormControlComponent,
    DateRangePickerComponent,
    UserPipe,
    UpdatedByComponent,
    CandidateSourceComponent,
    ViewCandidateOccupationComponent,
    ViewCandidateJobExperienceComponent,
    LanguageLevelFormControlComponent,
    CandidatePipe,
    EditCandidateJobExperienceComponent,
    CreateCandidateJobExperienceComponent,
    EditCandidateOccupationComponent,
    SortedByComponent,
    EditCandidateLanguageComponent,
    ViewCandidateAccountComponent,
    ChangePasswordComponent,
    CreateCandidateAttachmentComponent,
    EditCandidateAttachmentComponent,
    FileUploadComponent,
    CandidateAdditionalInfoTabComponent,
    ViewCandidateAdditionalInfoComponent,
    ViewCandidateSkillComponent,
    FileUploadComponent,
    InfographicComponent,
    ChartComponent,
    MonthPickerComponent,
    NotFoundComponent,
    GeneralTranslationsComponent,
    DefineSearchComponent,
    MonthPickerComponent,
    NotFoundComponent,
    ViewCandidateSpecialLinksComponent,
    EditCandidateSpecialLinksComponent,
    ViewCandidateSurveyComponent,
    EditCandidateAdditionalInfoComponent,
    EditCandidateSurveyComponent,
    CreateUpdateListComponent,
    SelectListComponent,
    BrowseCandidateSourcesComponent,
    CandidatesSearchComponent,
    CandidatesListComponent,
    CandidateSourceResultsComponent,
    CreateCandidateOccupationComponent,
    ShowCandidatesComponent,
    CreateUpdateListComponent,
    CreateCandidateOccupationComponent,
    CvIconComponent,
    JoblinkComponent,
    CandidateContextNoteComponent,
    ReturnedHomeComponent,
    CandidateIntakeTabComponent,
    VisaIssuesComponent,
    CitizenshipsComponent,
    CandidateCitizenshipCardComponent,
    AvailImmediateComponent,
    FamilyComponent,
    CandidateMiniIntakeTabComponent,
    IntRecruitmentComponent,
    RuralComponent,
    ReturnHomeSafeComponent,
    WorkPermitComponent,
    WorkLegallyComponent,
    WorkStatusComponent,
    HostEntryComponent,
    CandidateVisaTabComponent,
    RegistrationUnhcrComponent,
    RegistrationUnrwaComponent,
    HomeLocationComponent,
    AsylumYearComponent,
    DestinationComponent,
    DestinationsComponent,
    VisaAssessmentComponent,
    VisaCheckAuComponent,
    VisaCheckCaComponent,
    VisaCheckNzComponent,
    VisaCheckUkComponent,
    DestinationsComponent,
    DestinationLimitComponent,
    FixedInputComponent,
    ConfirmContactComponent,
    ExamsComponent,
    CandidateExamCardComponent,
    HasNameSelectorComponent,
    DestinationJobComponent,
    CrimeComponent,
    ConflictComponent,
    ResidenceStatusComponent,
    WorkAbroadComponent,
    HostEntryLegallyComponent,
    LeftHomeReasonComponent,
    ReturnHomeFutureComponent,
    ResettlementThirdComponent,
    HostChallengesComponent,
    MaritalStatusComponent,
    AutosaveStatusComponent,
    CandidateColumnSelectorComponent,
    AutosaveStatusComponent,
    MaritalStatusComponent,
    CandidateNameNumSearchComponent,
    MilitaryServiceComponent,
    VisaRejectComponent,
    DrivingLicenseComponent,
    DependantsComponent,
    DependantsCardComponent,
    LangAssessmentComponent,
    ExtendDatePipe,
    DatePickerComponent,
    IntProtectionComponent,
    HealthAssessmentComponent,
    CharacterAssessmentComponent,
    SecurityRiskComponent,
    TravelDocumentComponent,
    RiskAssessmentComponent,
    CreateVisaJobAssessementComponent,
    VisaFinalAssessmentComponent,
    JobOccupationComponent,
    SalaryTsmitComponent,
    RegionalAreaComponent,
    JobInterestComponent,
    JobFamilyAusComponent,
    JobEligibilityAssessmentComponent,
    VisaFourNineFourComponent,
    VisaOneEightSixComponent,
    VisaOtherOptionsComponent,
    YearsRelevantExpComponent,
    IeltsLevelComponent,
    QualificationRelevantComponent,
    DatePickerComponent,
    ShowQrCodeComponent,
    HealthIssuesComponent,
    VisaJobPutForwardComponent,
    VisaJobNotesComponent,
    VisaJobCheckAuComponent,
    CandidateStatusSelectorComponent,
    FinalAgreementComponent,
    CreateCandidateLanguageComponent,
    SalesforceStageComponent,
    IeltsScoreValidationComponent,
    FileSelectorComponent,
    NewJobComponent,
    OldIntakeInputComponent,
    CandidateShareableNotesComponent,
    ShareableDocsComponent,
    CandidateShareableNotesComponent,
    PublishedDocColumnSelectorComponent,
    CandidateSourceDescriptionComponent,
    SearchExternalLinksComponent,
    CreateExternalLinkComponent,
    EditExternalLinkComponent,
    CovidVaccinationComponent,
    EnglishThresholdComponent,
    FilterPipe,
    CandidateTaskTabComponent,
    FilterPipe,
    DownloadCvComponent,
    AssignTasksListComponent,
    AssignTasksCandidateComponent,
    EditTaskAssignmentComponent,
    ViewCandidateTasksComponent,
    BrowseTasksComponent,
    ViewTaskDetailsComponent,
    SearchTasksComponent,
    TasksMonitorComponent,
    ViewCandidateMediaWillingnessComponent,
    EditCandidateMediaWillingnessComponent,
    ViewResponseComponent,
    ViewCandidateRegistrationComponent,
    EditCandidateRegistrationComponent,
    EditTaskComponent,
    TasksMonitorListComponent,
    SearchPartnersComponent,
    CreateUpdatePartnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    RecaptchaV3Module,
    FormsModule,
    InfiniteScrollModule,
    NgMultiSelectDropDownModule.forRoot(),
    ChartsModule,
    NgxWigModule,
    NgSelectModule,
    LocalStorageModule.forRoot({
      prefix: 'tbb-admin',
      storageType: 'localStorage'
    }),
    DragulaModule.forRoot()
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: RECAPTCHA_V3_SITE_KEY, useValue: '6Lc_97cZAAAAAIDqR7gT3h_ROGU6P7Jif-wEk9Vu'},
    {provide: NgbDateAdapter, useClass: CustomDateAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter},
    AuthService,
    RoleGuardService,
    Title,
    DatePipe, TitleCasePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
