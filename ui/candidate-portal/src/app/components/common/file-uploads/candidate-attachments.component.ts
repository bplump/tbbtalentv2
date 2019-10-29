import {Component, Input, OnInit} from '@angular/core';
import {CandidateAttachmentService} from "../../../services/candidate-attachment.service";
import {CandidateAttachment} from "../../../model/candidate-attachment";
import {FormBuilder, FormGroup} from "@angular/forms";
import {S3UploadParams} from "../../../model/s3-upload-params";

@Component({
  selector: 'app-candidate-attachments',
  templateUrl: './candidate-attachments.component.html',
  styleUrls: ['./candidate-attachments.component.scss']
})
export class CandidateAttachmentsComponent implements OnInit {

  @Input() preview: boolean = false;

  error: any;
  loading: boolean = true;

  form: FormGroup;
  attachments: CandidateAttachment[] = [];

  constructor(private fb: FormBuilder,
              private candidateAttachmentService: CandidateAttachmentService) { }

  ngOnInit() {
    this.candidateAttachmentService.listCandidateAttachments().subscribe(
      (response) => {
        this.attachments = response;
        this.loading = false;
      },
      (error) => {
        this.error = error;
        this.loading = false;
      });
  }

  handleAttachmentUploaded(attachment: {s3Params: S3UploadParams, file: File}) {
    const request = {
      type: 'file',
      name: attachment.file.name,
      fileType: '',
      folder: attachment.s3Params.objectKey
    };
    this.candidateAttachmentService.createAttachment(request).subscribe(
      (response) => this.attachments.push(response),
      (error) => this.error = error);
  }

}
