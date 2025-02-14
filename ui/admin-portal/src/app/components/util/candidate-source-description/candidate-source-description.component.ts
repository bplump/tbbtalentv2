import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AutoSaveComponentBase} from "../autosave/AutoSaveComponentBase";
import {FormBuilder} from "@angular/forms";
import {Observable} from "rxjs";
import {Candidate} from "../../../model/candidate";
import {CandidateSource, UpdateCandidateSourceDescriptionRequest} from "../../../model/base";
import {CandidateService} from "../../../services/candidate.service";
import {CandidateSourceService} from "../../../services/candidate-source.service";

@Component({
  selector: 'app-candidate-source-description',
  templateUrl: './candidate-source-description.component.html',
  styleUrls: ['./candidate-source-description.component.scss']
})
export class CandidateSourceDescriptionComponent extends AutoSaveComponentBase
  implements OnInit, OnChanges {

  @Input() candidateSource: CandidateSource;

  constructor(private fb: FormBuilder, private candidateSourceService: CandidateSourceService) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      description: [this.candidateSource.description],
    });
  }

  get description(): string {
    return this.form.value?.description;
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Replace the form value with the new data when changing from one input to the next.
    if (this.form) {
      this.form.controls['description'].patchValue(this.candidateSource.description);
    }
  }

  doSave(formValue: any): Observable<void> {
    const request: UpdateCandidateSourceDescriptionRequest = {
      description: this.description
    }
    return this.candidateSourceService.updateDescription(this.candidateSource, request);
  }

  onSuccessfulSave(): void {
    this.candidateSource.description = this.description;
  }

}
