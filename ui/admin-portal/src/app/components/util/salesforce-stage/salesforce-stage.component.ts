import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {EnumOption, enumOptions} from "../../../util/enum";
import {CandidateOpportunityStage, SalesforceOppParams} from "../../../model/candidate";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

export interface SalesforceStageInfo {
  stageName?: string;
  nextStep?: string;
}

@Component({
  selector: 'app-salesforce-stage',
  templateUrl: './salesforce-stage.component.html',
  styleUrls: ['./salesforce-stage.component.scss']
})
export class SalesforceStageComponent implements OnInit {

  salesforceStageForm: FormGroup;
  candidateOpportunityStageOptions: EnumOption[] = enumOptions(CandidateOpportunityStage);

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.salesforceStageForm = this.fb.group({
      stage: [null],
      nextStep: [null],
    });
  }

  get nextStep(): string { return this.salesforceStageForm.value?.nextStep; }
  get stage(): string { return this.salesforceStageForm.value?.stage; }

  cancel() {
    this.activeModal.dismiss(false);
  }

  onSave() {
    const info: SalesforceOppParams = {
      //Note that this is an unusual case where we pass back the string value - rather that the key
      //of the enum.
      stageName: this.stage ? CandidateOpportunityStage[this.stage]: null,
      nextStep: this.nextStep
    }
    this.activeModal.close(info)
  }
}
