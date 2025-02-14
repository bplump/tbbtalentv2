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

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {Language} from "../../../../model/language";
import {LanguageService} from "../../../../services/language.service";
import {LanguageLevel} from "../../../../model/language-level";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LanguageLevelService} from "../../../../services/language-level.service";
import {LanguageLevelFormControlModel} from "./language-level-form-control-model";

@Component({
  selector: 'app-language-level-form-control',
  templateUrl: './language-level-form-control.component.html',
  styleUrls: ['./language-level-form-control.component.scss']
})
export class LanguageLevelFormControlComponent implements OnInit, OnChanges {

  @Input() model: LanguageLevelFormControlModel;
  @Input() languageDisabled: boolean;
  @Input() languageLevels: LanguageLevel[];
  @Input() languages: Language[];
  @Input() spokenLevel: LanguageLevel;
  @Input() writtenLevel: LanguageLevel;
  @Input() disable: boolean;

  @Output() modelUpdated = new EventEmitter<LanguageLevelFormControlModel>();

  disabledClasses;
  showMenu: boolean;
  form: FormGroup;

  constructor(private languageService: LanguageService,
              private languageLevelService: LanguageLevelService,
              private fb: FormBuilder) {

  }

  ngOnInit() {

    this.form = this.fb.group({
      languageId: [this.model ? this.model.languageId : null, Validators.required],
      writtenLevel: [this.model ? this.model.writtenLevel : null, Validators.required],
      spokenLevel: [this.model ? this.model.spokenLevel : null, Validators.required],
    });
    if (this.languageDisabled) {
      this.form.controls['languageId'].disable()
    }

    /* Load missing language */
    if (!this.languages) {
      this.languageService.listLanguages().subscribe(
        (response) => {
          this.languages = response;
        },
        (error) => {
          console.error(error);
        });
    }

    /* Load missing language levels */
    if (!this.languageLevels) {
      this.languageLevelService.listLanguageLevels().subscribe(
        (response) => {
          this.languageLevels = response;
        },
        (error) => {
          console.log('error', error);
        });
    }

    /* Subscribe to form value changes to emit updates to parent component */
    this.form.valueChanges.subscribe(() => this.modelUpdated.emit(this.form.value));
  }

  ngOnChanges(c: SimpleChanges) {
    //This is needed to grey out the language-label element (constructed by renderLevel below)
    //when this whole component is disabled (as controlled by the @Input disable - generally when
    //elastic search is being used).
    //If it is not present, the label does not appear as disabled.
    this.disabledClasses = {
      'disable': this.disable
    };
  }

  toggle() {
    if (!this.disable) {
      this.showMenu = !this.showMenu;
    }
  }

  open() {
    this.showMenu = true;
  }

  close() {
    this.showMenu = false;
  }

  renderLevel() {
    if (this.languageLevels) {
      const val = (this.form.value as LanguageLevelFormControlModel);
      const language = val.languageId ? this.languages.find(l => l.id === Number(val.languageId)).name : '';
      const written = val.writtenLevel !== null ? 'Written: ' + this.languageLevels.find(l => l.level === val.writtenLevel).name : '';
      const spoken = val.spokenLevel !== null ? 'Spoken: ' + this.languageLevels.find(l => l.level === val.spokenLevel).name : '';
      const proficiencyString = written && spoken ? written + ', ' + spoken : written || spoken;
      return language && proficiencyString ? `${language} (${proficiencyString})` : language ? language : proficiencyString;
    }
  }

  clearProficiencies() {
    this.form.patchValue({
      writtenLevel: null,
      spokenLevel: null
    })
  }

  clearSpoken() {
    this.form.patchValue({
      spokenLevel: null
    })
  }

  clearWritten() {
    this.form.patchValue({
      writtenLevel: null
    })
  }

  patchModel(model: LanguageLevelFormControlModel) {
    for (const key of Object.keys(model)) {
      this.form.controls[key].patchValue(model[key]);
    }

  }
}
