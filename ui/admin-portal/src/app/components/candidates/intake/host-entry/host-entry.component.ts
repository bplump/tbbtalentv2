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

import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {CandidateService} from '../../../../services/candidate.service';
import {IntakeComponentBase} from '../../../util/intake/IntakeComponentBase';
import {enumKeysToEnumOptions, EnumOption, enumOptions} from '../../../../util/enum';
import {LeftHomeReason, YesNo, YesNoUnsure} from '../../../../model/candidate';
import {generateYearArray} from '../../../../util/year-helper';
import {Country} from "../../../../model/country";

@Component({
  selector: 'app-host-entry',
  templateUrl: './host-entry.component.html',
  styleUrls: ['./host-entry.component.scss']
})
export class HostEntryComponent extends IntakeComponentBase implements OnInit {

  // Reduced questions in mini intake (
  @Input() showAll: boolean = true;
  @Input() countries: Country[];

  public hostBornOptions: EnumOption[] = enumOptions(YesNo);
  public hostEntryLegallyOptions: EnumOption[] = enumOptions(YesNo);
  public returnedHomeOptions: EnumOption[] = enumOptions(YesNo);
  public homeSafeOptions: EnumOption[] = enumOptions(YesNoUnsure);
  public leftHomeReasonOptions: EnumOption[] = enumOptions(LeftHomeReason);
  public returnHomeFutureOptions: EnumOption[] = enumOptions(YesNoUnsure);

  years: number[];

  constructor(fb: FormBuilder, candidateService: CandidateService) {
    super(fb, candidateService);
  }

  // Year is converted to string using the ngb-date-adapter file in the util folder (see app module providers)
  ngOnInit(): void {
    this.years = generateYearArray(1950, true);
    const options: EnumOption[] =
      enumKeysToEnumOptions(this.candidateIntakeData?.leftHomeReasons, LeftHomeReason);
    this.form = this.fb.group({
      birthCountryId: [this.candidateIntakeData?.birthCountry?.id],
      hostEntryYear: [this.candidateIntakeData?.hostEntryYear],
      hostEntryYearNotes: [this.candidateIntakeData?.hostEntryYearNotes],
      asylumYear: [this.candidateIntakeData?.asylumYear],
      hostEntryLegally: [this.candidateIntakeData?.hostEntryLegally],
      hostEntryLegallyNotes: [this.candidateIntakeData?.hostEntryLegallyNotes],
      returnedHome: [this.candidateIntakeData?.returnedHome],
      returnedHomeReason: [this.candidateIntakeData?.returnedHomeReason],
      returnedHomeReasonNo: [this.candidateIntakeData?.returnedHomeReasonNo],
      returnHomeSafe: [this.candidateIntakeData?.returnHomeSafe],
      leftHomeReasons: [options],
      leftHomeNotes: [this.candidateIntakeData?.leftHomeNotes],
      returnHomeFuture: [this.candidateIntakeData?.returnHomeFuture],
      returnHomeWhen: [this.candidateIntakeData?.returnHomeWhen],
    });
  }

  get countryIdAsNumber(): number {
    return parseFloat(this.form.value?.birthCountryId);
  }

  get enterLegally(): string {
    return this.form.value?.hostEntryLegally;
  }

  get returnedHome(): string {
    return this.form.value?.returnedHome;
  }

  get hasOther(): boolean {
    let found: boolean;
    // Check if reasons is an array of objects or strings (changes the way we handle the search for Other)
    if (this.form?.value?.leftHomeReasons?.some((r: EnumOption) => r.key)) {
      found = this.form?.value?.leftHomeReasons?.find((r: EnumOption) => r.key === 'Other');
    } else {
      found = this.form?.value?.leftHomeReasons?.includes('Other')
    }
    return found;
  }

  get returnHomeFuture(): string {
    return this.form.value?.returnHomeFuture;
  }

  get hasNotes(): boolean {
    if (this.form.value?.hostEntryYear == null || this.form.value?.hostEntryYear === '') {
      return false;
    } else {
      return true;
    }
  }

  get notHostBorn(): boolean {
    let born: boolean;
    if (this.form.value?.birthCountryId) {
      // Check if the candidate was born in their current country location (host country)
      if (this.countryIdAsNumber === this.candidate?.country?.id) {
        born = false;
      } else {
        born = true;
      }
    } else {
      born = false;
    }
    return born
  }
}
