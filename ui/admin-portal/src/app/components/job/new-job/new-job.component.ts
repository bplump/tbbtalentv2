import {Component, OnInit} from '@angular/core';
import {JoblinkValidationEvent} from "../../util/joblink/joblink.component";
import {SavedList} from "../../../model/saved-list";
import {SavedListService} from "../../../services/saved-list.service";
import {
  PostJobToSlackRequest,
  Progress,
  UpdateEmployerOpportunityRequest
} from "../../../model/base";
import {getCandidateSourceExternalHref} from "../../../model/saved-search";
import {Location} from "@angular/common";
import {Router} from "@angular/router";
import {SalesforceService} from "../../../services/salesforce.service";
import {SlackService} from "../../../services/slack.service";
import {AuthService} from "../../../services/auth.service";
import {UpdateJobRequest} from "../../../model/job";
import {JobService} from "../../../services/job.service";

@Component({
  selector: 'app-new-job',
  templateUrl: './new-job.component.html',
  styleUrls: ['./new-job.component.scss']
})
export class NewJobComponent implements OnInit {
  jobName: string;
  savedList: SavedList;
  sfJoblink: string;
  slacklink: string;
  creatingJob: Progress = Progress.NotStarted;
  creatingFolders: Progress = Progress.NotStarted;
  creatingSFLinks: Progress = Progress.NotStarted;
  postingToSlack: Progress = Progress.NotStarted;
  findingJob: boolean;
  errorFindingJob: string = null;
  errorCreatingFolders: string = null;
  errorCreatingJob: string = null;
  errorCreatingSFLinks: string = null;
  errorPostingToSlack: string = null;

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    public salesforceService: SalesforceService,
    private savedListService: SavedListService,
    private slackService: SlackService,
    private location: Location,
    private router: Router) { }

  ngOnInit(): void {
  }

  get listLink(): string {
    return getCandidateSourceExternalHref(this.router, this.location, this.savedList);
  }
  get Progress() {
    return Progress;
  }

  get progressPercent(): number {
    let pct = 0;
    if (this.creatingJob === Progress.Finished) {
      pct += 25;
    }
    if (this.creatingFolders === Progress.Finished) {
      pct += 25;
    }
    if (this.creatingSFLinks === Progress.Finished) {
      pct += 25;
    }
    if (this.postingToSlack === Progress.Finished) {
      pct += 25;
    }
    return pct;
  }


  onJoblinkValidation(jobOpportunity: JoblinkValidationEvent) {
    this.creatingJob = Progress.NotStarted;
    this.creatingFolders = Progress.NotStarted;
    this.creatingSFLinks = Progress.NotStarted;
    this.postingToSlack = Progress.NotStarted;

    if (jobOpportunity.valid) {
      this.sfJoblink = jobOpportunity.sfJoblink;
      this.jobName = jobOpportunity.jobname;
    } else {
      this.jobName = null;
    }
  }

  onJoblinkError(error) {
    this.errorFindingJob = error;
    if (error) {
      this.jobName = null;
    }
  }


  private createRegisteredJob() {
    this.errorCreatingJob = null;

    this.creatingJob = Progress.Started;
    const request: UpdateJobRequest = {
      sfJoblink: this.sfJoblink ? this.sfJoblink : null
    };
    this.jobService.create(request).subscribe(
      (job) => {
        this.creatingJob = Progress.Finished;
        this.savedList = job.submissionList;
        this.createFolders();
      },
      (error) => {
        this.errorCreatingJob = error;
        this.creatingJob = Progress.NotStarted;
      });
  }

  private createFolders() {
    this.errorCreatingFolders = null;
    this.creatingFolders = Progress.Started;
    this.savedListService.createFolder(this.savedList.id).subscribe(
      savedList => {
        this.savedList = savedList;
        this.createSFBacklinks();
        this.creatingFolders = Progress.Finished;
      },
      error => {
        this.errorCreatingFolders = error;
        this.creatingFolders = Progress.NotStarted;
      });
  }

  private createSFBacklinks() {
    this.errorCreatingSFLinks = null;
    this.creatingSFLinks = Progress.Started;

    const request: UpdateEmployerOpportunityRequest = {
      sfJoblink: this.salesforceService.joblink(this.savedList),
      folderlink: this.savedList.folderlink,
      foldercvlink: this.savedList.foldercvlink,
      folderjdlink: this.savedList.folderjdlink,
      listlink: this.listLink
    };
    this.salesforceService.updateEmployerOpportunity(request).subscribe(
      () => {
        this.creatingSFLinks = Progress.Finished;
      },
      error => {
        this.errorCreatingSFLinks = error;
        this.creatingSFLinks = Progress.NotStarted;
      });

    //Slack post can run in parallel with creating SF backlinks
    this.postJobToSlack();

  }

  private postJobToSlack() {
    this.errorPostingToSlack = null;
    this.postingToSlack = Progress.Started;

    const request: PostJobToSlackRequest = {
      sfJoblink: this.salesforceService.joblink(this.savedList),
      jobName: this.jobName,
      folderlink: this.savedList.folderlink,
      foldercvlink: this.savedList.foldercvlink,
      folderjdlink: this.savedList.folderjdlink,
      listlink: this.listLink
    };
    this.slackService.postJob(request).subscribe(
      (response) => {
        this.slacklink = response.slackChannelUrl;
        this.postingToSlack = Progress.Finished;
      },
      error => {
        this.errorPostingToSlack = error;
        this.postingToSlack = Progress.NotStarted;
      });

  }

  doRegistration() {
    this.createRegisteredJob()
  }
}
