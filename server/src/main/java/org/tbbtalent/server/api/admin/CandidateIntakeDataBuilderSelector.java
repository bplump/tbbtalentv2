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

import javax.validation.constraints.NotNull;
import org.tbbtalent.server.util.dto.DtoBuilder;

/**
 * Utility for selecting the right DTO build based on the currently logged in
 * user.
 *
 * @author John Cameron
 */
public class CandidateIntakeDataBuilderSelector {

    public CandidateIntakeDataBuilderSelector() {
    }

    public @NotNull DtoBuilder selectBuilder() {
        return candidateIntakeDto();
    }

    private DtoBuilder candidateIntakeDto() {
        return new DtoBuilder()
                .add("asylumYear")
                .add("availImmediate")
                .add("availImmediateJobOps")
                .add("availImmediateReason")
                .add("availImmediateNotes")
                .add("birthCountry", countryDto())

                .add("candidateCitizenships", candidateCitizenshipDto())

                .add("candidateDependants", candidateDependantDto())
                .add("candidateDestinations", candidateDestinationDto())

                .add("candidateExams", candidateExamDto())

                .add("candidateVisaChecks", candidateVisaCheckDto())

                .add("canDrive")

                .add("conflict")
                .add("conflictNotes")

                .add("covidVaccinated")
                .add("covidVaccinatedStatus")
                .add("covidVaccinatedDate")
                .add("covidVaccineName")
                .add("covidVaccineNotes")

                .add("crimeConvict")
                .add("crimeConvictNotes")

                .add("destLimit")
                .add("destLimitNotes")

                .add("drivingLicense")
                .add("drivingLicenseExp")
                .add("drivingLicenseCountry", countryDto())

                .add("familyMove")
                .add("familyMoveNotes")

                .add("healthIssues")
                .add("healthIssuesNotes")
                .add("homeLocation")
                .add("hostChallenges")
                .add("hostEntryYear")
                .add("hostEntryYearNotes")
                .add("hostEntryLegally")
                .add("hostEntryLegallyNotes")
                .add("intRecruitReasons")
                .add("intRecruitOther")
                .add("intRecruitRural")
                .add("intRecruitRuralNotes")

                .add("langAssessment")
                .add("langAssessmentScore")
                .add("leftHomeReasons")
                .add("leftHomeNotes")
                .add("militaryService")
                .add("militaryWanted")
                .add("militaryNotes")
                .add("militaryStart")
                .add("militaryEnd")

                .add("maritalStatus")
                .add("maritalStatusNotes")
                .add("partnerRegistered")
                .add("partnerCandidate", partnerCandidateDto())
                .add("partnerEduLevel", englishLevelDto())
                .add("partnerEduLevelNotes")
                .add("partnerOccupation", occupationDto())
                .add("partnerOccupationNotes")
                .add("partnerEnglish")
                .add("partnerEnglishLevel", languageLevelDto())
                .add("partnerIelts")
                .add("partnerIeltsScore")
                .add("partnerIeltsYr")
                .add("partnerCitizenship", countryDto())

                .add("residenceStatus")
                .add("residenceStatusNotes")

                .add("returnedHome")
                .add("returnedHomeReason")
                .add("returnedHomeReasonNo")

                .add("returnHomeSafe")
                .add("returnHomeFuture")
                .add("returnHomeWhen")

                .add("resettleThird")
                .add("resettleThirdStatus")

                .add("unhcrRegistered")
                .add("unhcrStatus")
                .add("unhcrNumber")
                .add("unhcrFile")
                .add("unhcrNotRegStatus")
                .add("unhcrConsent")
                .add("unhcrNotes")

                .add("unrwaRegistered")
                .add("unrwaNumber")
                .add("unrwaFile")
                .add("unrwaNotRegStatus")
                .add("unrwaNotes")

                .add("visaReject")
                .add("visaRejectNotes")
                .add("visaIssues")
                .add("visaIssuesNotes")

                .add("workAbroad")
                .add("workAbroadNotes")
                .add("workPermit")
                .add("workPermitDesired")
                .add("workPermitDesiredNotes")
                .add("workDesired")
                .add("workDesiredNotes")

                ;
    }

    private DtoBuilder candidateCitizenshipDto() {
        return new DtoBuilder()
                .add("id")
                .add("nationality", countryDto())
                .add("hasPassport")
                .add("passportExp")
                .add("notes")
                ;
    }

    private DtoBuilder candidateExamDto() {
        return new DtoBuilder()
                .add("id")
                .add("exam")
                .add("otherExam")
                .add("score")
                .add("year")
                .add("notes")
                ;
    }

    private DtoBuilder candidateDependantDto() {
        return new DtoBuilder()
                .add("id")
                .add("relation")
                .add("relationOther")
                .add("dob")
                .add("gender")
                .add("name")
                .add("registered")
                .add("registeredNumber")
                .add("registeredNotes")
                .add("healthConcern")
                .add("healthNotes")
                ;
    }
    private DtoBuilder candidateDestinationDto() {
        return new DtoBuilder()
                .add("id")
                .add("country", countryDto())
                .add("interest")
                .add("family")
                .add("location")
                .add("notes")
                ;
    }

    private DtoBuilder candidateVisaCheckDto() {
        return new DtoBuilder()
                .add("id")
                .add("candidateVisaJobChecks", visaJobCheckDto())
                .add("country", countryDto())
                .add("protection")
                .add("protectionGrounds")
                .add("englishThreshold")
                .add("englishThresholdNotes")
                .add("healthAssessment")
                .add("healthAssessmentNotes")
                .add("characterAssessment")
                .add("characterAssessmentNotes")
                .add("securityRisk")
                .add("securityRiskNotes")
                .add("overallRisk")
                .add("overallRiskNotes")
                .add("validTravelDocs")
                .add("validTravelDocsNotes")
                .add("assessmentNotes")
                .add("createdBy", userDto())
                .add("createdDate")
                .add("updatedBy", userDto())
                .add("updatedDate")
                ;
    }

    private DtoBuilder visaJobCheckDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                .add("sfJobLink")
                .add("interest")
                .add("interestNotes")
                .add("regional")
                .add("salaryTsmit")
                .add("interest")
                .add("interestNotes")
                .add("qualification")
                .add("eligible_494")
                .add("eligible_494_Notes")
                .add("eligible_186")
                .add("eligible_186_Notes")
                .add("eligibleOther")
                .add("eligibleOtherNotes")
                .add("putForward")
                .add("tbbEligibility")
                .add("notes")
                .add("occupation", occupationDto())
                .add("occupationNotes")
                .add("qualificationNotes")
                ;
    }

    private DtoBuilder userDto() {
        return new DtoBuilder()
                .add("id")
                .add("firstName")
                .add("lastName")
                ;
    }

    private DtoBuilder occupationDto() {
        return new DtoBuilder()
                .add("id")
                ;
    }

    private DtoBuilder englishLevelDto() {
        return new DtoBuilder()
                .add("id")
                ;
    }

    private DtoBuilder languageLevelDto() {
        return new DtoBuilder()
                .add("id")
                ;
    }

    private DtoBuilder countryDto() {
        return new DtoBuilder()
                .add("id")
                .add("name")
                ;
    }

    private DtoBuilder partnerCandidateDto() {
        return new DtoBuilder()
                .add("id")
                .add("candidateNumber")
                .add("user", userDto())
                ;
    }

}
