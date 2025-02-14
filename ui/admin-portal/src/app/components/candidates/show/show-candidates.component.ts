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
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import {
  Candidate,
  SalesforceOppParams,
  UpdateCandidateStatusInfo,
  UpdateCandidateStatusRequest
} from '../../../model/candidate';
import {CandidateService} from '../../../services/candidate.service';
import {SearchResults} from '../../../model/search-results';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {
  CreateFromDefaultSavedSearchRequest,
  SavedSearchService
} from '../../../services/saved-search.service';
import {Observable, of, Subscription} from 'rxjs';
import {CandidateReviewStatusItem} from '../../../model/candidate-review-status-item';
import {HttpClient} from '@angular/common/http';
import {
  ClearSelectionRequest,
  getCandidateSourceBreadcrumb,
  getCandidateSourceExternalHref,
  getCandidateSourceNavigation,
  getCandidateSourceStatsNavigation,
  getSavedSearchBreadcrumb,
  getSavedSourceNavigation,
  isSavedSearch,
  SavedSearch,
  SavedSearchGetRequest,
  SavedSearchRef,
  SearchCandidateRequestPaged,
  SelectCandidateInSearchRequest
} from '../../../model/saved-search';
import {
  CandidateSource,
  canEditSource,
  defaultReviewStatusFilter,
  indexOfHasId,
  isMine,
  isStarredByMe,
  ReviewStatus,
  Status
} from '../../../model/base';
import {
  CachedSourceResults,
  CandidateSourceResultsCacheService
} from '../../../services/candidate-source-results-cache.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {User} from '../../../model/user';
import {AuthService} from '../../../services/auth.service';
import {UserService} from '../../../services/user.service';
import {SelectListComponent, TargetListSelection} from '../../list/select/select-list.component';
import {
  ContentUpdateType,
  CopySourceContentsRequest,
  IHasSetOfCandidates,
  isSavedList,
  PublishedDocColumnConfig,
  PublishedDocImportReport,
  PublishListRequest,
  SavedList,
  SavedListGetRequest,
  UpdateExplicitSavedListContentsRequest
} from '../../../model/saved-list';
import {
  CandidateSourceCandidateService
} from '../../../services/candidate-source-candidate.service';
import {LocalStorageService} from 'angular-2-local-storage';
import {
  EditCandidateReviewStatusItemComponent
} from '../../util/candidate-review/edit/edit-candidate-review-status-item.component';
import {Router} from '@angular/router';
import {CandidateSourceService} from '../../../services/candidate-source.service';
import {SavedListCandidateService} from '../../../services/saved-list-candidate.service';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import {Location} from '@angular/common';
import {copyToClipboard} from '../../../util/clipboard';
import {SavedListService} from '../../../services/saved-list.service';
import {ConfirmationComponent} from '../../util/confirm/confirmation.component';
import {
  CandidateColumnSelectorComponent
} from '../../util/candidate-column-selector/candidate-column-selector.component';
import {CandidateFieldInfo} from '../../../model/candidate-field-info';
import {CandidateFieldService} from '../../../services/candidate-field.service';
import {EditCandidateStatusComponent} from "../view/status/edit-candidate-status.component";
import {SalesforceStageComponent} from "../../util/salesforce-stage/salesforce-stage.component";
import {FileSelectorComponent} from "../../util/file-selector/file-selector.component";
import {PublishedDocColumnService} from "../../../services/published-doc-column.service";
import {
  PublishedDocColumnSelectorComponent
} from "../../util/published-doc-column-selector/published-doc-column-selector.component";
import {AssignTasksListComponent} from "../../tasks/assign-tasks-list/assign-tasks-list.component";
import {Task} from "../../../model/task";
import {SalesforceService} from "../../../services/salesforce.service";
import {SalesforceJobOpp} from "../../../model/job";

interface CachedTargetList {
  sourceID: number;
  listID: number;
  name: string;
  replace: boolean
}

@Component({
  selector: 'app-show-candidates',
  templateUrl: './show-candidates.component.html',
  styleUrls: ['./show-candidates.component.scss']
})
export class ShowCandidatesComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('downloadCsvErrorModal', {static: true}) downloadCsvErrorModal;

  @Input() candidateSource: CandidateSource;
  @Input() manageScreenSplits: boolean = true;
  @Input() showBreadcrumb: boolean = true;
  @Input() pageNumber: number;
  @Input() pageSize: number;
  @Input() searchRequest: SearchCandidateRequestPaged;
  @Output() candidateSelection = new EventEmitter();
  @Output() editSource = new EventEmitter();

  selectedFields: CandidateFieldInfo[] = [];


  error: any;
  loading: boolean;
  searching: boolean;
  exporting: boolean;
  importing: boolean;
  importingFeedback: boolean;
  publishing: boolean;
  updating: boolean;
  updatingStatuses: boolean;
  updatingTasks: boolean;
  savingSelection: boolean;
  searchForm: FormGroup;
  monitoredTask: Task;
  tasksAssignedToList: Task[];

  results: SearchResults<Candidate>;
  subscription: Subscription;
  sortField = 'id';
  sortDirection = 'DESC';

  /* Add candidates support */
  doNumberOrNameSearch;
  searchFailed: boolean;


  /* MULTI SELECT */
  statuses: string[];

  currentCandidate: Candidate;
  private selectedCandidates: Candidate[];
  loggedInUser: User;
  targetListName: string;
  targetListId: number;
  targetListReplace: boolean;
  savedSelection: boolean;
  timestamp: number;
  private reviewStatusFilter: string[] = defaultReviewStatusFilter;
  savedSearchSelectionChange: boolean;

  private noCandidatesMessage = "No candidates are selected";

  public filterSearch: boolean = false;

  constructor(private http: HttpClient,
              private fb: FormBuilder,
              private candidateService: CandidateService,
              private candidateSourceService: CandidateSourceService,
              private candidateSourceCandidateService: CandidateSourceCandidateService,
              private userService: UserService,
              private savedSearchService: SavedSearchService,
              private savedListCandidateService: SavedListCandidateService,
              private savedListService: SavedListService,
              private modalService: NgbModal,
              private localStorageService: LocalStorageService,
              private location: Location,
              private router: Router,
              private candidateSourceResultsCacheService: CandidateSourceResultsCacheService,
              private candidateFieldService: CandidateFieldService,
              private authService: AuthService,
              private publishedDocColumnService: PublishedDocColumnService,
              public salesforceService: SalesforceService

  ) {
    this.searchForm = this.fb.group({
      statusesDisplay: [defaultReviewStatusFilter],
    });
  }

  ngOnInit() {

    this.setCurrentCandidate(null);
    this.loggedInUser = this.authService.getLoggedInUser();
    this.selectedCandidates = [];

    this.statuses = [];
    for (const key in ReviewStatus) {
      if (isNaN(Number(key))) {
        this.statuses.push(key);
      }
    }

    this.searchForm = this.fb.group({
      keyword: ['']
    });
    this.subscribeToFilterChanges();

    this.doNumberOrNameSearch = (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.error = null
        }),
        switchMap(candidateNumberOrName =>
          this.candidateService.findByCandidateNumberOrName(
            {candidateNumberOrName: candidateNumberOrName, pageSize: 10}).pipe(
            tap(() => this.searchFailed = false),
            map(result => result.content),
            catchError(() => {
              this.searchFailed = true;
              return of([]);
            }))
        )
      );

  }

  get pluralType() {
     return isSavedSearch(this.candidateSource) ? "searches" : "lists";
  }

  get keyword(): string {
    return this.searchForm ? this.searchForm.value.keyword : "";
  }

  subscribeToFilterChanges(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.filterSearch = true;
        this.doSearch(true);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    //If we get both a source change and a request change, do the source
    //change in preference to the request change because the source change
    //in that case will be a saved search and it will load a new search request
    //anyway - being the search request associated with the saved search.

    if (changes.candidateSource) {
      if (changes.candidateSource.previousValue !== changes.candidateSource.currentValue) {
        if (this.candidateSource) {

          //Set the selected fields to be displayed.
          this.loadSelectedFields()

          //Retrieve the list previously used for saving selections from this
          // source (if any)
          this.restoreTargetListFromCache();
          this.doSearch(true);
          // Set the selected candidates (List only) to null when changing candidate source.
          this.selectedCandidates = [];

        }
      }
    }
    if (changes.searchRequest) {
      if (changes.searchRequest.previousValue !== changes.searchRequest.currentValue) {
        if (this.searchRequest) {
          this.updatedSearch();
        }
      }
    }
  }

  isSelected(candidate: Candidate): boolean {
    let selected: boolean;
    if (isSavedSearch(this.candidateSource)) {
      selected = candidate.selected;
    } else {
      selected = indexOfHasId(candidate.id, this.selectedCandidates) >= 0;
    }
    return selected;
  }

  /**
   * True if any candidates are currently selected.
   */
  isSelection(): boolean {
    let isSelection: boolean;
    if (isSavedSearch(this.candidateSource)) {
      //Saved searches handle selections differently - they need a server request to check
      //selections - so we need to manage that a bit more efficiently.
      isSelection = true;
    } else {
      isSelection = this.selectedCandidates != null && this.selectedCandidates.length > 0;
    }
    return isSelection;
  }

  private loadSelectedFields() {
    this.selectedFields = this.candidateFieldService
      .getCandidateSourceFields(this.candidateSource, true);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updatedSearch() {
    this.results = null;
    this.error = null;
    this.searching = true;
    const request = this.searchRequest;

    //Search passed in externally will not have current reviewStatusFilter applied
    //because that is only managed by this component. So fill it in.
    if (this.isReviewable()) {
      request.reviewStatusFilter = this.reviewStatusFilter;
    }

    request.pageNumber = this.pageNumber - 1;
    request.pageSize = this.pageSize;
    request.sortFields = [this.sortField];
    request.sortDirection = this.sortDirection;

    this.subscription = this.candidateService.search(request).subscribe(
      results => {
        this.results = results;
        this.cacheResults();
        this.searching = false;
      },
      error => {
        this.error = error;
        this.searching = false;
      });
  }

  doSearch(refresh: boolean, usePageNumber = true) {

    this.results = null;
    this.error = null;

    let done: boolean = false;

    if (!refresh) {

      //Is there anything in cache?
      //We only cache certain results
      if (this.isCacheable()) {
        const cached: CachedSourceResults =
          this.candidateSourceResultsCacheService.getFromCache(this.candidateSource);
        if (cached) {
          //If we are not required to use the pageNumber (usePageNumber = false)
          //we can take the pageNumber of whatever the cache has.
          //If we have to use the page number, the pageNumber and size must match
          //what is in the cache or we can't use it.
          done = !usePageNumber ||
            (cached.pageNumber === this.pageNumber && cached.pageSize === this.pageSize);
          if (done) {
            this.results = cached.results;
            this.sortField = cached.sortFields[0];
            this.sortDirection = cached.sortDirection;
            this.reviewStatusFilter = defaultReviewStatusFilter;
            this.timestamp = cached.timestamp;
            this.pageNumber = cached.pageNumber;
            this.pageSize = cached.pageSize;
          }
        }
      }
    }

    if (!done) {
      /*
       * Fetch results from the server rather than from any local cache.
       * <p/>
       * This component is used in two ways:
       * - To display saved lists
       * - To display saved searches.
       * This affects the way to a refresh is done.
       *
       * For saved lists, it is simply going to the server requesting the requested
       * page of the list.
       *
       * For saved searches, it is made more complicated because saved searches
       * can be displayed with details of the exact search, which are available
       * for the user to modify if they wish - thus changing the search.
       * But those changes are only stored on the server when the user clicks on
       * Update Search.
       * So, at any time there are potentially two different searches:
       * - the one stored on the server
       * - the modified one on the browser
       *
       * The results displayed to the user looking at a saved search are those
       * which incorporate their local browser changes
       *
       * So... when we want to refresh a saved search, we don't want to use the
       * version stored on the server. But with a saved list we do.
       */

      //If we are being driven by a manually modifiable search request, submit
      //that search.
      if (this.searchRequest) {

        this.updatedSearch()

      } else {

        //Run the saved list or saved search as stored on the server.

        //Saved the current candidate selection, then set it to null while we are searching.
        //Then we restore it at the end of the search. This means that anything displaying
        //info on the current selection will update its data.
        const saveCurrentCandidate = this.currentCandidate;
        this.setCurrentCandidate(null);

        this.searching = true;

        //Create the appropriate request
        let request;
        if (isSavedSearch(this.candidateSource)) {
          request = new SavedSearchGetRequest();
        } else {
          request = new SavedListGetRequest();
        }
        request.keyword = this.keyword;
        request.pageNumber = this.pageNumber - 1;
        request.pageSize = this.pageSize;
        request.sortFields = [this.sortField];
        request.sortDirection = this.sortDirection;
        if (request instanceof SavedSearchGetRequest) {
          request.reviewStatusFilter = this.reviewStatusFilter;
        }

        this.candidateSourceCandidateService.searchPaged(
          this.candidateSource, request).subscribe(
          results => {
            this.results = results;
            this.cacheResults();

            //Restore the selection prior to the search
            this.setCurrentCandidate(saveCurrentCandidate);

            this.searching = false;
          },
          error => {
            this.error = error;
            this.searching = false;
          });
      }
    }
  }

  private cacheResults() {
    this.timestamp = Date.now();

    //We only cache certain results, and we don't cache filter keyword searches
    if (this.isCacheable() && !this.filterSearch) {
      this.candidateSourceResultsCacheService.cache(this.candidateSource,
        {
        id: this.candidateSource.id,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sortFields: [this.sortField],
        sortDirection: this.sortDirection,
        results: this.results,
        timestamp: this.timestamp
      });
    }
  }

  private isCacheable(): boolean {
    return !this.isReviewable() ||
      //If reviewable, the only results that are cached are for the default review filter
      this.reviewStatusFilter.toString() === defaultReviewStatusFilter.toString();
  }

  setCurrentCandidate(candidate: Candidate) {
    this.currentCandidate = candidate;
    if (candidate && isSavedSearch(this.candidateSource)) {
      this.savedSearchSelectionChange = candidate.selected;
    }
    this.candidateSelection.emit(candidate);
  }

  viewCandidate(candidate: Candidate) {
    this.setCurrentCandidate(candidate);
  }

  onReviewStatusChange() {
    this.doSearch(true);
  }

  toggleSort(column) {
    if (this.sortField === column) {
      this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sortField = column;
      this.sortDirection = 'ASC';
    }
    this.doSearch(true);
  }

  importCandidates() {

    if (isSavedList(this.candidateSource)) {

      const fileSelectorModal = this.modalService.open(FileSelectorComponent, {
        centered: true,
        backdrop: 'static'
      })

      fileSelectorModal.componentInstance.validExtensions = ['csv', 'txt'];
      fileSelectorModal.componentInstance.maxFiles = 1;
      fileSelectorModal.componentInstance.closeButtonLabel = "Import";
      fileSelectorModal.componentInstance.title = "Select file containing candidate numbers";
      fileSelectorModal.componentInstance.instructions = "Select a file with one of the above " +
        "extensions which contains a candidate number at the start of each line. " +
        "This will work for a spreadsheet that has been exported in csv format as long as " +
        "candidate numbers are in the first column of the spreadsheet. " +
        "Other data in the spreadsheet will be ignored. Any header line will also be ignored.";

      fileSelectorModal.result
      .then((selectedFiles: File[]) => {
        this.doImport(selectedFiles);
      })
      .catch(() => { /* Isn't possible */ });
    }
  }

  private doImport(files: File[]) {
    const formData: FormData = new FormData();
    formData.append('file', files[0]);

    this.error = null;
    this.importing = true;
    this.savedListCandidateService.mergeFromFile(this.candidateSource.id, formData).subscribe(
      result => {
        this.importing = false;
        this.doSearch(true);
      },
      error => {
        this.error = error;
        this.importing = false;
      }
    )
  }

  exportCandidates() {
    this.exporting = true;

    //Create the appropriate request
    let request;
    if (isSavedSearch(this.candidateSource)) {
      request = new SavedSearchGetRequest();
    } else {
      request = new SavedListGetRequest();
    }

    //Note: The page number and size are ignored in this call (all records are exported).
    //Only the sort fields are processed.
    request.sortFields = [this.sortField];
    request.sortDirection = this.sortDirection;
    if (request instanceof SavedSearchGetRequest) {
      request.reviewStatusFilter = this.reviewStatusFilter;
    }

    this.candidateSourceCandidateService.export(this.candidateSource, request).subscribe(
      result => {
        const options = {type: 'text/csv;charset=utf-8;'};
        const filename = 'candidates.csv';
        this.createAndDownloadBlobFile(result, options, filename);
        this.exporting = false;
      },
      err => {
        const reader = new FileReader();
        const _this = this;
        reader.addEventListener('loadend', function () {
          if (typeof reader.result === 'string') {
            _this.error = JSON.parse(reader.result);
            const modalRef = _this.modalService.open(_this.downloadCsvErrorModal);
            modalRef.result
              .then(() => {
              })
              .catch(() => {
              });
          }
        });
        reader.readAsText(err.error);
        this.exporting = false;
      }
    );
  }

  private publishCandidates(exportColumns: PublishedDocColumnConfig[]) {
    this.publishing = true;
    this.error = null;

    //Construct the request
    const request: PublishListRequest = new PublishListRequest();
    request.columns = exportColumns;

    this.savedListService.publish(this.candidateSource.id, request).subscribe(
      (result: SavedList) => {
        if (isSavedList(this.candidateSource)) {
          //Update the list's published doc link and the export columns
          this.candidateSource.publishedDocLink = result.publishedDocLink;
        }
        this.candidateSource.exportColumns = result.exportColumns;
        this.publishing = false;
      },
      error => {
        this.error = error;
        this.publishing = false;
      }
    );
  }

  importEmployerFeedback() {
    this.importingFeedback = true;
    this.error = null;

    this.savedListService.importEmployerFeedback(this.candidateSource.id).subscribe(
      (result) => {
        this.importingFeedback = false;
        //Refresh to display any changed salesforce stages
        this.doSearch(true);
        this.displayImportFeedbackReport(result);
      },
      error => {
        this.error = error;
        this.importingFeedback = false;
      }
    );
  }

  private displayImportFeedbackReport(report: PublishedDocImportReport) {
    const showReport = this.modalService.open(ConfirmationComponent, {
      centered: true, backdrop: 'static'});
    showReport.componentInstance.title = "Feedback Import Report";
    showReport.componentInstance.showCancel = false;
    let mess = report.message + ".";
    if (report.numEmployerFeedbacks > 0) {
      mess += " Stored employer feedback for " + report.numEmployerFeedbacks + " candidates on Salesforce.";
    }
    if (report.numJobOffers > 0) {
      mess += " Recorded job offers for " + report.numJobOffers + " candidates.";
    }
    if (report.numNoJobOffers > 0) {
      mess += " Closed job opportunities for " + report.numNoJobOffers + " candidates.";
    }

    showReport.componentInstance.message = mess;
  }

  modifyExportColumns() {
    const modal = this.modalService.open(PublishedDocColumnSelectorComponent, {size: "lg", scrollable: true});

    modal.componentInstance.availableColumns = this.publishedDocColumnService.getColumnConfigFromAllColumns();
    modal.componentInstance.selectedColumns =  this.publishedDocColumnService.getColumnConfigFromExportColumns(this.candidateSource.exportColumns);

    modal.result
      .then((request: PublishedDocColumnConfig[]) => {
          this.publishCandidates(request);

        },
        error => this.error = error
      )
      .catch();
  }

  createAndDownloadBlobFile(body, options, filename) {
    const blob = new Blob([body], options);
    if ('msSaveBlob' in navigator) {
      // IE 10+
      // @ts-ignore
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      // Browsers that support HTML5 download attribute
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  downloadCv(candidate) {
    const tab = window.open();
    this.candidateService.downloadCv(candidate.id).subscribe(
      result => {
        const fileUrl = URL.createObjectURL(result);
        tab.location.href = fileUrl;
      },
      error => {
          this.error = error;
      }
    )
  }

  getBreadcrumb(): string {
    let breadcrumb: string;
    if (isSavedSearch(this.candidateSource)) {
      const infos = this.savedSearchService.getSavedSearchTypeInfos();
      breadcrumb = getSavedSearchBreadcrumb(this.candidateSource, infos);
    } else {
      breadcrumb = getCandidateSourceBreadcrumb(this.candidateSource);
    }
    return breadcrumb;
  }

  onReviewStatusFilterChange() {

    this.reviewStatusFilter = this.searchForm.value.statusesDisplay;

    //We can ignore page number because changing the reviewStatus filter will
    //completely change the number of results.
    //Ignoring the page number will allow the cache to supply pageNumber
    //if it has something cached.
    //Note also that a refresh will still need to be done if the review filter is not
    //the default review filter - because that is all that is cached. This is handled in doSearch.
    this.doSearch(false, false);
  }

  haveTargetList(): boolean {
    return this.targetListName && this.targetListName.length > 0;
  }

  isContentModifiable(): boolean {
    return !isSavedSearch(this.candidateSource);
  }

  isReviewable(): boolean {
    return isSavedSearch(this.candidateSource)
      ? this.candidateSource.reviewable : false;
  }

  isSalesforceUpdatable(): boolean {
    return !isSavedSearch(this.candidateSource);
  }

  isSavedList(): boolean {
    return !isSavedSearch(this.candidateSource);
  }

  isSwapSelectionSupported(): boolean {
    //Not supported for saved searches because swapping an empty selection on a search could
    //potentially end up selecting huge numbers of candidates - up to the whole database.
    return !isSavedSearch(this.candidateSource);
  }

  sourceType(): string {
    return isSavedSearch(this.candidateSource) ? 'savedSearch' : 'list';
  }

  isShareable(): boolean {
    let shareable: boolean = false;

    //Is shareable with me if it is not created by me.
    if (this.candidateSource) {
        //was it created by me?
        if (!isMine(this.candidateSource, this.authService)) {
          shareable = true;
        }
    }
    return shareable;
  }

  isGlobal(): boolean {
    return this.candidateSource.global;
  }

  isImportable(): boolean {
    return isSavedList(this.candidateSource);
  }

  isPublishable(): boolean {
    return isSavedList(this.candidateSource);
  }

  isStarred(): boolean {
    return isStarredByMe(this.candidateSource, this.authService);
  }

  isShowStage(): boolean {
    return isSavedList(this.candidateSource) && this.candidateSource.sfJobOpp != null;
  }

  isEditable(): boolean {
    return canEditSource(this.candidateSource, this.authService);
  }

  onSelectionChange(candidate: Candidate, selected: boolean) {

    //Record change
    candidate.selected = selected;
    //Update cache
    this.cacheResults();

    if (isSavedSearch(this.candidateSource)) {
      //Saved search selection change

      if (candidate.contextNote && !selected) {
        //They have a context note which they will lose if they deselect.
        //Ask for confirmation.
        const confirmation = this.modalService.open(ConfirmationComponent, {
          centered: true,
          backdrop: 'static'
        });
        confirmation.componentInstance.message =
          'You will lose the context note for ' + candidate.user.firstName +
          ' if you deselect this. Are you sure?';
        confirmation.result
          .then((confirmed: boolean) => {
            if (confirmed) {
              //Clear local copy of note
              //Note that this does not trigger an update through to the
              //contextNote component.
              //That is why we use the savedSearchSelectionChange variable
              //which is passed down as an input to the contextNote component
              //and can trigger an action which updates the local contextNote
              //form field.
              candidate.contextNote = null;
              this.savedSearchSelectionChange = false;
              this.doSavedSearchSelection(candidate, selected);
            } else {
              //Unconfirmed, reinstate as selected
              candidate.selected = true;
            }
          })
          .catch(() => {
            //Unconfirmed, reinstate as selected
            candidate.selected = true;
          });
      } else {
        this.savedSearchSelectionChange = selected;
        this.doSavedSearchSelection(candidate, selected);
      }
    } else {
      //For lists maintain local candidate selections
      if (selected) {
        this.selectedCandidates.push(candidate);
      } else {
        this.selectedCandidates = this.selectedCandidates.filter(c => c.id !== candidate.id);
      }
    }
  }

  private doSavedSearchSelection(candidate: Candidate, selected: boolean) {
    //Record change on server
    //Candidate is added/removed from this users selection list for this saved search
    this.error = null;
    const request: SelectCandidateInSearchRequest = {
      userId: this.loggedInUser.id,
      candidateId: candidate.id,
      selected: selected
    };
    this.savedSearchService.selectCandidate(this.candidateSource.id, request).subscribe(
      () => {
      },
      err => {
        this.error = err;
      }
    );
  }

  /**
   * Opens window to user's configured email client (eg GMail) with a new email to be completed
   * by the user, sent to a TBB account and BCCing the emails of all selected candidates.
   */
  copyEmails() {
    if (isSavedList(this.candidateSource)) {
      //Concatenate all selected candidate emails.
      let emails: string = "";
      let numEmails: number = 0;
      for (const candidate of this.selectedCandidates) {
        const email = candidate?.user.email;
        if (email) {
          emails += email + "\n";
          numEmails += 1;
        }
      }
      copyToClipboard(emails);
      const copyConfirm = this.modalService.open(ConfirmationComponent, {
        centered: true, backdrop: 'static'});
      copyConfirm.componentInstance.title = "Copied " + numEmails + " emails to clipboard";
      copyConfirm.componentInstance.showCancel = false;
      copyConfirm.componentInstance.message = "Paste the emails where you want.";
    }
  }

  saveSelection() {
    this.error = null;

    if (isSavedSearch(this.candidateSource)) {
      this.savedSearchService.getSelectionCount(this.candidateSource.id).subscribe(
        (nSelections: number) => {
          if (nSelections === 0) {
            this.error = this.noCandidatesMessage;
          } else {
            this.requestSaveSelection();
          }
        },
        (error) => {
          this.error = error;
        });
    } else {
      const nSelections = this.selectedCandidates.length;
      if (nSelections === 0) {
        this.error = this.noCandidatesMessage;
      } else {
        this.requestSaveSelection();
      }
    }
  }

  /**
   * Selected becomes unselected and vice versa.
   * <p/>
   * Note that this only works for saved lists. Html should prevent
   * this from being called - but if it is, it will do nothing.
   */
  swapSelection() {
    if (isSavedList(this.candidateSource)) {

      //First of all, get all candidates in this list from the server.
      this.searching = true;
      this.error = null;
      this.candidateSourceCandidateService.list(this.candidateSource).subscribe(
        (candidates: Candidate[]) => {
          //Now do the actual swap
          this.doSwapSelection(candidates)
          this.searching = false;
        },
        error => {
          this.error = error;
          this.searching = false;
        });
    }
  }

  /**
   * Selected becomes unselected and vice versa.
   * <p/>
   * Note: only works for saved lists - not saved sources.
   * @param candidates All candidates
   */
  private doSwapSelection(candidates: Candidate[]) {
    //This will contain the new selection
    const newSelectedCandidates: Candidate[] = [];

    //Invert the selection by looking at all candidates, and if they are not currently selected
    //add them to newSelectedCandidates.
    for (const candidate of candidates) {
      //Look for this candidate's id in the currently selected candidates
      if (indexOfHasId(candidate.id, this.selectedCandidates) < 0) {
        //Not in currently selected - so add to new selected.
        newSelectedCandidates.push(candidate);
      }
    }
    //Switch to new selection
    this.selectedCandidates = newSelectedCandidates;
  }

  private requestSaveSelection() {
    //Show modal allowing for list selection
    const modal = this.modalService.open(SelectListComponent);
    modal.componentInstance.action = "Save";
    modal.componentInstance.title = "Save Selection to List";
    if (this.candidateSource.sfJobOpp != null) {
      modal.componentInstance.sfJoblink = this.salesforceService.joblink(this.candidateSource);
    }
    if (!isSavedSearch(this.candidateSource)) {
      modal.componentInstance.excludeList = this.candidateSource;
    }

    modal.result
    .then((selection: TargetListSelection) => {
      this.doSaveSelection(selection);
    })
    .catch(() => { /* Isn't possible */
    });
  }

  saveSelectionAgain() {
    const request: TargetListSelection = {
      savedListId: this.targetListId,
      replace: this.targetListReplace
    };
    this.doSaveSelection(request);
  }

  private doSaveSelection(targetListSelection: TargetListSelection) {
    //Save selection as specified in request
    this.savingSelection = true;
    this.error = null;

    if (isSavedSearch(this.candidateSource)) {

      const savedSearch = this.candidateSource;

      if (!savedSearch.defaultSearch) {

        //If the search is already saved, just save the selection
        this.saveSavedSearchSelection(savedSearch, targetListSelection);

      } else {

        //If default search, auto save the search, then save the selection

        const ssCreateRequest: CreateFromDefaultSavedSearchRequest = {
          savedListId: targetListSelection.savedListId,
          name: targetListSelection.newListName,
          sfJoblink: targetListSelection.sfJoblink
        };
        this.savedSearchService.createFromDefaultSearch(ssCreateRequest).subscribe(
          (newSavedSearch) => {

            this.saveSavedSearchSelection(newSavedSearch, targetListSelection);

            //Navigate away from the default saved search to the newly created
            //search.
            const urlCommands = getCandidateSourceNavigation(newSavedSearch);
            this.savingSelection = false;
            this.router.navigate(urlCommands);
          },
          (error) => {
            this.error = error;

            //Even if auto saved search failed, we still want to save the selection
            this.saveSavedSearchSelection(savedSearch, targetListSelection);
          });
      }

    } else {
      // LIST

      const savedListId = targetListSelection.savedListId;
      const request: UpdateExplicitSavedListContentsRequest = {
        name: targetListSelection.newListName,
        statusUpdateInfo: targetListSelection.statusUpdateInfo,
        updateType: targetListSelection.replace ? ContentUpdateType.replace : ContentUpdateType.add,
        sfJoblink: targetListSelection.sfJoblink,
        candidateIds: this.selectedCandidates.map(c => c.id),
        sourceListId: this.candidateSource.id
      };
      // If request has a savedListId, merge or replace. Otherwise create a new list.
      if (savedListId > 0) {
        this.replaceOrMergeList(savedListId, request);
      } else {
        // create new saved list
        this.createList(request);
      }
    }
  }

  private saveSavedSearchSelection(savedSearch: SavedSearch, targetChoice: TargetListSelection) {
    const request: CopySourceContentsRequest = {
      savedListId: targetChoice.savedListId,
      newListName: targetChoice.newListName,
      updateType: targetChoice.replace ? ContentUpdateType.replace : ContentUpdateType.add,
      sfJoblink: targetChoice.sfJoblink,
      statusUpdateInfo: targetChoice.statusUpdateInfo,

    }
    this.savedSearchService.saveSelection(savedSearch.id, request)
      .subscribe(
        savedListResult => {
          this.savingSelection = false;

          //Save the target list
          this.targetListId = savedListResult.id;
          this.targetListName = savedListResult.name;
          this.targetListReplace = targetChoice.replace;
          this.savedSelection = true;

          //Associate current target list with this source.
          this.cacheTargetList(savedSearch);

          //Invalidate the cache for this list (so that user does not need
          //to refresh in order to see latest list contents)
          this.candidateSourceResultsCacheService.removeFromCache(savedListResult);

          this.savingSelection = false;

          if (targetChoice.statusUpdateInfo != null) {
            //Refresh display to see updated statuses
            this.doSearch(true);
          }

        },
        err => {
          this.error = err;
          this.savingSelection = false;
        });
  }

  private replaceOrMergeList(savedListId: number, request: UpdateExplicitSavedListContentsRequest) {
    //Get saved list
    this.savedListService.get(savedListId).subscribe(
      (savedList) => {
        this.targetListName = savedList.name;
      }
    )
    this.savedListCandidateService.saveSelection(savedListId, request).subscribe(
      () => {
        this.savingSelection = false;
        //Save the target list
        this.targetListId = savedListId;
        this.targetListReplace = request.updateType === ContentUpdateType.replace;
        this.savedSelection = true;
        //Invalidate the cache for this list (so that user does not need
        //to refresh in order to see latest list contents)
        this.candidateSourceResultsCacheService.removeFromCache(this.candidateSource);

        if (request.statusUpdateInfo != null) {
          //Refresh display to see updated statuses
          this.doSearch(true);
        }

      },
      (error) => {
        this.savingSelection = false;
        this.error = error;
      }
    );
  }

  private createList(request: UpdateExplicitSavedListContentsRequest) {
    this.savedListCandidateService.create(request).subscribe(
      savedListResult => {
        this.savingSelection = false;
        //Save the target list
        this.targetListId = savedListResult.id;
        this.targetListName = savedListResult.name;
        this.targetListReplace = request.updateType === ContentUpdateType.replace;

        //Remember the target list for this source so that the user does not
        //have type in details each time they want to save
        this.cacheTargetList();

        //Invalidate the cache for this list (so that user does not need
        //to refresh in order to see latest list contents)
        this.candidateSourceResultsCacheService.removeFromCache(savedListResult);

        if (request.statusUpdateInfo != null) {
          //Refresh display to see updated statuses
          this.doSearch(true);
        }
      },
      (error) => {
        this.savingSelection = false;
        this.error = error;
      })
  }

  clearSelection() {
    if (isSavedSearch(this.candidateSource)) {
      const request: ClearSelectionRequest = {
        userId: this.loggedInUser.id,
      };
      this.savedSearchService.clearSelection(this.candidateSource.id, request).subscribe(
        () => {
          this.doSearch(true);
        },
        err => {
          this.error = err;
        });
    } else {
      //For saved lists, the candidate data - including whether or not they have been selected
      //is not saved anywhere, so just doing a refresh will clear all displayed selections
      this.doSearch(true);
    }
    this.selectedCandidates = [];
  }

  /**
   * We keep track of the list used to save selections in local memory
   * associated with the candidate source.
   */
  private cacheTargetList(source: CandidateSource = this.candidateSource) {
    const cachedTargetList: CachedTargetList = {
      sourceID: source.id,
      listID: this.targetListId,
      name: this.targetListName,
      replace: this.targetListReplace
    }
    this.localStorageService.set(this.savedTargetListKey(source), cachedTargetList);
  }

  /**
   * We keep track of the list used to save selections in local memory
   * associated with the candidate source.
   */
  private restoreTargetListFromCache() {
    const cachedTargetList: CachedTargetList =
       this.localStorageService.get(this.savedTargetListKey());
    this.targetListId = cachedTargetList ? cachedTargetList.listID : null;
    this.targetListName = cachedTargetList ? cachedTargetList.name : null;
    this.targetListReplace = cachedTargetList ? cachedTargetList.replace : null;

  }

  private savedTargetListKey(source: CandidateSource = this.candidateSource): string {
    return "Target" + source.id;
  }

  review(candidate: Candidate) {
    const editModal = this.modalService.open(EditCandidateReviewStatusItemComponent, {
      centered: true,
      backdrop: 'static'
    });

    let item: CandidateReviewStatusItem = null;
    const items: CandidateReviewStatusItem[] = candidate.candidateReviewStatusItems;
    if (items) {
      item = items.find(s => s.savedSearch.id === this.candidateSource.id);
    }

    editModal.componentInstance.candidateReviewStatusItemId = item ? item.id : null;
    editModal.componentInstance.candidateId = candidate.id;
    editModal.componentInstance.savedSearch = this.candidateSource as SavedSearch;

    editModal.result
      .then(() => this.onReviewStatusChange())
      .catch(() => { /* Isn't possible */ });

  }

  doCopyLink() {
    const text = getCandidateSourceExternalHref(
      this.router, this.location, this.candidateSource);
    copyToClipboard(text);
    const showReport = this.modalService.open(ConfirmationComponent, {
      centered: true, backdrop: 'static'});
    showReport.componentInstance.title = "Copied link to clipboard";
    showReport.componentInstance.showCancel = false;
    showReport.componentInstance.message = "Paste the link where you want";
    showReport.componentInstance.message = "Paste the link (" + text + ") where you want";

  }

  addCandidateToList(candidate: Candidate) {
    const request: IHasSetOfCandidates = {
      candidateIds: [candidate.id]
    };
    this.savedListCandidateService.merge(this.candidateSource.id, request).subscribe(
      () => {
        this.doSearch(true);
      },
      (error) => {
        this.error = error;
      }
    );

  }

  private removeFromList(candidates: Candidate[]) {

    //Need to deselect any candidates being removed.
    this.selectedCandidates = this.selectedCandidates.filter(c => !candidates.includes(c));

    const request: IHasSetOfCandidates = {
      candidateIds: candidates.map(c => c.id)
    };
    this.savedListCandidateService.remove(this.candidateSource.id, request).subscribe(
      () => {
        this.doSearch(true);
      },
      (error) => {
        this.error = error;
      }
    );
  }

  removeCandidateFromList(candidate: Candidate) {
    this.removeFromList([candidate]);
  }

  removeSelectedCandidatesFromList() {
    this.removeFromList(this.selectedCandidates);
  }

  renderCandidateRow(candidate: Candidate) {
    if (this.candidateFieldService.isCandidateNameViewable()) {
      return candidate.candidateNumber + ": " + candidate.user.firstName + " " + candidate.user.lastName;
    } else {
      return candidate.candidateNumber;
    }
  }

  selectSearchResult ($event, input) {
    $event.preventDefault();
    input.value = '';
    const candidate: Candidate = $event.item;
    this.addCandidateToList(candidate);

  }

  /**
   * Updates/creates candidate related records on Salesforce.
   * <p/>
   * Only works with saved lists (a bit dangerous with saved searches which could involve
   * very large numbers of candidates - even all candidates on database!).
   * Should be disabled in html for saved searches, but if it does get called for a search, it
   * will do nothing.
   */
  createUpdateSalesforce() {
    if (isSavedList(this.candidateSource)) {
      const nSelections = this.selectedCandidates.length;
      if (nSelections === 0) {
        //No candidates are selected, check whether the user wants to apply to the whole list.
        const applyToWholeListQuery = this.modalService.open(ConfirmationComponent, {
          centered: true, backdrop: 'static'});
        applyToWholeListQuery.componentInstance.message =
          'There are no candidates selected. Would you like to apply to everyone in the list?';
        applyToWholeListQuery.result
        .then((confirmed) => {if (confirmed === true) {
          this.doCreateUpdateSalesforceOnList(false);
          }})
        .catch(() => { });
      } else {
        this.doCreateUpdateSalesforceOnList(true);
      }
    }
  }

  private doCreateUpdateSalesforceOnList(selectedCandidatesOnly: boolean) {
    if (!this.candidateSource.sfJobOpp) {
      //If we do not have a job opportunity, there will be no candidate opp info.
      this.doCreateUpdateSalesforceOnList2(null, selectedCandidatesOnly);
    } else {
      const applyToWholeListQuery = this.modalService.open(SalesforceStageComponent, {size: 'lg'});
      applyToWholeListQuery.result
      .then((info: SalesforceOppParams) => {
        this.doCreateUpdateSalesforceOnList2(info, selectedCandidatesOnly);
      })
      .catch(() => { });
    }
}

  private doCreateUpdateSalesforceOnList2(info: SalesforceOppParams, selectedCandidatesOnly: boolean) {
    this.error = null;
    this.updating = true;

    if (selectedCandidatesOnly) {
      const sfJobOpp: SalesforceJobOpp = this.candidateSource.sfJobOpp;
      if (sfJobOpp) {
        const candidateIds: number[] = this.selectedCandidates.map(c => c.id);
        this.candidateService.createUpdateSalesforceFromCandidates(candidateIds, sfJobOpp.id, info)
        .subscribe(result => {
            //Refresh to display any changed stages
            this.doSearch(true);
            this.updating = false;
          },
          err => {this.error = err; this.updating = false; }
        );
      }
    } else {
      this.candidateService.createUpdateSalesforceFromList(this.candidateSource, info)
      .subscribe(result => {
          //Refresh to display any changed salesforce stages
          this.doSearch(true);
          this.updating = false;
        },
        err => {this.error = err; this.updating = false; }
      );
    }
  }

  doEditSource() {
    this.editSource.emit(this.candidateSource);
  }

  isDefaultSavedSearch(): boolean {
    if (isSavedSearch(this.candidateSource)) {
      return this.candidateSource?.defaultSearch;
    } else {
     return false;
    }
  }

  private getSavedSearchSource(): SavedSearchRef {
    if (isSavedList(this.candidateSource)) {
      return this.candidateSource?.savedSearchSource;
    } else {
      return null;
    }
  }

  hasSavedSearchSource(): boolean {
    return this.getSavedSearchSource() != null;
  }

  hasPublishedDoc() {
    return isSavedList(this.candidateSource) && this.candidateSource.publishedDocLink != null;
  }

  doShowPublishedDoc() {
    if (isSavedList(this.candidateSource)) {
      const folderlink = this.candidateSource.publishedDocLink;
      if (folderlink) {
        //Open link in new window
        window.open(folderlink, "_blank");
      }
    }
  }

  doShowListFolder() {
    if (isSavedList(this.candidateSource)) {
      const folderlink = this.candidateSource.folderlink;
      if (folderlink) {
        //Open link in new window
        window.open(folderlink, "_blank");
      } else {
        this.error = null;
        this.searching = true;
        this.savedListService.createFolder(this.candidateSource.id).subscribe(
          savedList => {
            this.candidateSource = savedList;
            this.searching = false;
            window.open(savedList.folderlink, "_blank");
          },
          error => {
            this.error = error;
            this.searching = false;
          });
      }
    }
  }

  doShowSearch() {
    const savedSearchSource = this.getSavedSearchSource();
    if (savedSearchSource != null) {
      this.router.navigate(getSavedSourceNavigation(savedSearchSource));
    }
  }

  doRunStats() {
    //Navigate to the infographics requesting it to run stats on this source.
    const urlCommands = getCandidateSourceStatsNavigation(this.candidateSource);
    this.router.navigate(urlCommands);
  }

  doSelectColumns() {
    //Initialize with current configuration
    //Output is new configuration
    const modal = this.modalService.open(CandidateColumnSelectorComponent, {scrollable: true});
    modal.componentInstance.setSourceAndFormat(this.candidateSource, true);

    modal.result
      .then(
        () => this.loadSelectedFields(),
        error => this.error = error
      )
      .catch();
  }

  isCandidateNameViewable() {
    return this.candidateFieldService.isCandidateNameViewable()
  }

  updateStatusOfSelection() {
    this.error = null;

    if (isSavedSearch(this.candidateSource)) {
      this.savedSearchService.getSelectionCount(this.candidateSource.id).subscribe(
        (nSelections: number) => {
          if (nSelections === 0) {
            this.error = this.noCandidatesMessage;
          } else {
            this.requestNewStatusInfo(nSelections);
          }
        },
        (error) => {
          this.error = error;
        });
    } else {
      const nSelections = this.selectedCandidates.length;
      if (nSelections === 0) {
        this.error = this.noCandidatesMessage;
      } else {
        this.requestNewStatusInfo(nSelections);
      }
    }
  }

  private requestNewStatusInfo(nSelections: number) {
    const modal = this.modalService.open(EditCandidateStatusComponent);
    if (nSelections > 1) {
      modal.componentInstance.text = "WARNING: You are about to set the status of " +
        nSelections + " candidates. This can only be undone manually, one by one.";
    }
    modal.result
    .then((info: UpdateCandidateStatusInfo) => {
      this.updateCandidateStatuses(info);
    } )
    .catch(() => { /* Isn't possible */ }
    );
  }

  private updateCandidateStatuses(info: UpdateCandidateStatusInfo) {
    this.updatingStatuses = true;
    this.error = null;

    if (isSavedSearch(this.candidateSource)) {
      this.savedSearchService.updateSelectedStatuses(this.candidateSource.id, info).subscribe(
        () => {
          //Refresh display tp see updated statuses
          this.doSearch(true);
          this.updatingStatuses = false;
        },
        (error) => {
          this.error = error;
          this.updatingStatuses = false;
        });
    } else {
      const request: UpdateCandidateStatusRequest = {
        candidateIds: this.selectedCandidates.map(c => c.id),
        info: info
      };
      this.candidateService.updateStatus(request).subscribe(
        () => {
          //Update local candidates with new status
          for (const candidate of this.selectedCandidates) {
            candidate.status = info.status;
          }
          this.updatingStatuses = false;
        },
        (error) => {
          this.error = error;
          this.updatingStatuses = false;
        });
    }
  }

  assignTasks() {
    const modal = this.modalService.open(AssignTasksListComponent, {scrollable: true, size: "xl"});
    if (isSavedList(this.candidateSource)) {
      modal.componentInstance.setTasks(this.candidateSource);
    }

    modal.result.then(
        (result) => {
          if (result != null) {
            this.monitoredTask = result;
            this.doSearch(true);
          } else {
            this.doSearch(true);
          }
        }
      )
      .catch();
  }

  hasTaskAssignments(candidate: Candidate): boolean {
    const active = candidate.taskAssignments?.filter(ta => ta.status === Status.active);
    return active?.length > 0;
  }

  doCopySource() {
    //Show modal allowing for list selection
    const modal = this.modalService.open(SelectListComponent);
    modal.componentInstance.action = "Copy";
    modal.componentInstance.title = "Copy to another List";
    modal.componentInstance.excludeList = this.candidateSource;

    modal.result
      .then((selection: TargetListSelection) => {
        this.loading = true;
        const request: CopySourceContentsRequest = {
          savedListId: selection.savedListId,
          newListName: selection.newListName,
          sourceListId: this.candidateSource.id,
          statusUpdateInfo: selection.statusUpdateInfo,
          updateType: selection.replace ? ContentUpdateType.replace : ContentUpdateType.add,
          sfJoblink: this.salesforceService.joblink(this.candidateSource)

        }
        this.candidateSourceService.copy(this.candidateSource, request).subscribe(
          (targetSource) => {
            this.targetListId = targetSource.id;
            this.targetListName = targetSource.name;
            // Set to false, to allow display of copied message in html. Otherwise it will display the saved message.
            this.savedSelection = false;

            //Clear cache for target list as its contents will have changed.
            this.candidateSourceResultsCacheService.removeFromCache(targetSource);

            this.loading = false;
          },
          error => {
            this.error = error;
            this.loading = false;
          }
        );
      })
      .catch(() => { /* Isn't possible */
      });
  }

  // When admins want to resolve outstanding tasks to bring the task count to all completed.
  resolveTaskAssignments() {
    this.error = null;
    const nSelections = this.selectedCandidates.length;
    if (nSelections === 0) {
      this.error = this.noCandidatesMessage;
    } else {
      if (isSavedList(this.candidateSource)) {
        this.updatingTasks = true;
        const request = {
          candidateIds: this.selectedCandidates.map(c => c.id)
        };
        this.candidateService.resolveOutstandingTasks(request).subscribe(
          () => {
            this.doSearch(true);
            this.updatingTasks = false;
          },
          (error) => {
            this.error = error;
            this.updatingTasks = false;
          });
      }
    }
  }

  getCompletedMonitoredTasks(candidate: Candidate) {
    if (this.monitoredTask != null) {
      let monitoredTask = candidate.taskAssignments.filter(ta => ta.task.id === this.monitoredTask.id && ta.status === Status.active);
      return monitoredTask.filter(ta => (ta.completedDate != null || ta.abandonedDate != null));
    } else {
      // DEFAULT tasks to monitor are required tasks
      // Only run through active tasks.
      let activeTaskAssignments = candidate.taskAssignments.filter(ta => ta.status === Status.active);
      return activeTaskAssignments.filter(ta => (ta.completedDate != null || ta.abandonedDate != null) && !ta.task.optional);
    }
  }

  getTotalMonitoredTasks(candidate: Candidate) {
    if (this.monitoredTask != null) {
      return candidate.taskAssignments.filter(ta => ta.task.id === this.monitoredTask.id && ta.status === Status.active);
    } else {
      // DEFAULT tasks to monitor are required tasks
      // Only run through active tasks.
      let activeTaskAssignments = candidate.taskAssignments.filter(ta => ta.status === Status.active);
      return activeTaskAssignments.filter(ta => !ta.task.optional);
    }
  }

  hasTasksAssigned() {
    if (isSavedList(this.candidateSource)) {
      this.tasksAssignedToList = this.candidateSource.tasks;
      return this.candidateSource.tasks.length > 0;
    }
  }

  doToggleStarred() {
    this.loading = true;
    this.error = null
    if (this.isStarred()) {
      this.candidateSourceService.unstarSourceForUser(
        this.candidateSource, {userId: this.loggedInUser.id}).subscribe(
        result => {
          this.candidateSource = result;
          this.loading = false;
        },
        error => {
          this.error = error;
          this.loading = false;
        }
      );
    } else {
      this.candidateSourceService.starSourceForUser(
        this.candidateSource, {userId: this.loggedInUser.id}).subscribe(
        result => {
          //Update local copy
          this.candidateSource = result;
          this.loading = false;
        },
        error => {
          this.error = error;
          this.loading = false;
        }
      );
    }
  }
}
