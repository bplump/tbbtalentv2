import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TaskAssignment} from "../../../../../../../model/candidate";
import {FormBuilder, FormGroup} from "@angular/forms";
import {forkJoin, Observable} from "rxjs";
import {CandidateAttachment} from "../../../../../../../model/candidate-attachment";
import {TaskAssignmentService} from "../../../../../../../services/task-assignment.service";

@Component({
  selector: 'app-candidate-task',
  templateUrl: './candidate-task.component.html',
  styleUrls: ['./candidate-task.component.scss']
})
export class CandidateTaskComponent implements OnInit {
  @Input() selectedTask: TaskAssignment;
  @Output() back = new EventEmitter();
  form: FormGroup;
  loading: boolean;
  uploading: boolean;
  error;

  constructor(private fb: FormBuilder,
              private taskAssignmentService: TaskAssignmentService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      comment: [''],
    });
  }

  startServerUpload($event) {
    this.error = null;
    this.uploading = true;

    const uploads: Observable<TaskAssignment>[] = [];
    for (const file of $event.files) {
      const formData: FormData = new FormData();
      // todo we want to name the file based on the file type uploaded
      formData.append('file', file);

      uploads.push(this.taskAssignmentService.completeUploadTask(this.selectedTask.id, formData));
    }

    forkJoin(...uploads).subscribe(
      (results: CandidateAttachment[]) => {
        this.uploading = false;
      },
      error => {
        this.error = error;
        this.uploading = false;
      }
    );
  }

  goBack() {
    this.selectedTask = null;
    this.back.emit();
  }

  isOverdue(ta: TaskAssignment) {
    return (new Date(ta.dueDate) < new Date()) && !ta.task.optional;
  }

}
