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

import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Candidate, CandidateIntakeData} from '../../../../model/candidate';
import {CandidateExamService, CreateCandidateExamRequest} from '../../../../services/candidate-exam.service';
import {Subject} from "rxjs";
import {NgbAccordion} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-exams',
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.scss']
})
export class ExamsComponent implements OnInit {

  @Input() candidate: Candidate;
  @Input() candidateIntakeData: CandidateIntakeData;
  error: boolean;
  saving: boolean;
  activeIds: string;
  open: boolean;

  @Input() toggleAll: Subject<any>;

  @ViewChild(NgbAccordion) acc: NgbAccordion;

  constructor(
    private candidateExamService: CandidateExamService
  ) {}

  ngOnInit(): void {
    this.activeIds = 'intake-exams';
    this.open = true;
    // called when the toggleAll method is called in the parent component
    this.toggleAll.subscribe(isOpen => {
      this.open = isOpen;
      this.setActiveIds();
    })
  }

  toggleOpen() {
    this.open = !this.open
    this.setActiveIds();
  }

  setActiveIds(){
    if (this.open) {
      this.acc.expandAll();
      this.activeIds = 'intake-exams';
    } else {
      this.acc.collapseAll();
      this.activeIds = '';
    }
  }

  addRecord() {
    this.saving = true;
    this.open = true;
    this.setActiveIds();
    const request: CreateCandidateExamRequest = {};
    this.candidateExamService.create(this.candidate.id, request).subscribe(
      (exam) => {
        this.candidateIntakeData.candidateExams.unshift(exam)
        this.saving = false;
      },
      (error) => {
        this.error = error;
        this.saving = false;
      });
  }

  deleteRecord(i: number) {
    this.candidateIntakeData.candidateExams.splice(i, 1);
  }

}
