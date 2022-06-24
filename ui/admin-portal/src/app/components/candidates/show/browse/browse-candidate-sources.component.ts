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
import {SearchResults} from '../../../../model/search-results';
import {FormBuilder, FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {
  indexOfAuditable,
  isSavedSearch,
  SavedSearchSubtype,
  SavedSearchType,
  SearchSavedSearchRequest
} from '../../../../model/saved-search';
import {
  SavedSearchService,
  SavedSearchTypeSubInfo
} from '../../../../services/saved-search.service';
import {Router} from '@angular/router';
import {LocalStorageService} from 'angular-2-local-storage';
import {AuthService} from '../../../../services/auth.service';
import {User} from '../../../../model/user';
import {
  CandidateSource,
  CandidateSourceType,
  isMine,
  isSharedWithMe,
  SearchBy
} from '../../../../model/base';
import {
  ContentUpdateType,
  CopySourceContentsRequest,
  isSavedList,
  SearchSavedListRequest
} from '../../../../model/saved-list';
import {CandidateSourceService} from '../../../../services/candidate-source.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CreateUpdateListComponent} from '../../../list/create-update/create-update-list.component';
import {SelectListComponent, TargetListSelection} from '../../../list/select/select-list.component';
import {CandidateSourceResultsCacheService} from '../../../../services/candidate-source-results-cache.service';
import {CreateUpdateSearchComponent} from '../../../search/create-update/create-update-search.component';
import {ConfirmationComponent} from '../../../util/confirm/confirmation.component';

@Component({
  selector: 'app-browse-candidate-sources',
  templateUrl: './browse-candidate-sources.component.html',
  styleUrls: ['./browse-candidate-sources.component.scss']
})
export class BrowseCandidateSourcesComponent implements OnInit, OnChanges {

  private filterKeySuffix: string = 'Filter';
  private savedStateKeyPrefix: string = 'BrowseKey';

  @Input() sourceType: CandidateSourceType;
  @Input() searchBy: SearchBy;
  @Input() savedSearchType: SavedSearchType;
  @Input() savedSearchSubtype: SavedSearchSubtype;
  @Input() savedSearchTypeSubInfos: SavedSearchTypeSubInfo[];
  @Output() subtypeChange = new EventEmitter<SavedSearchTypeSubInfo>();

  searchForm: FormGroup;
  public loading: boolean;
  error: any;
  pageNumber: number;
  pageSize: number;
  results: SearchResults<CandidateSource>;
  selectedSource: CandidateSource;
  selectedIndex = 0;
  loggedInUser: User;

  constructor(private fb: FormBuilder,
              private localStorageService: LocalStorageService,
              private router: Router,
              private authService: AuthService,
              private modalService: NgbModal,
              private candidateSourceResultsCacheService: CandidateSourceResultsCacheService,
              private candidateSourceService: CandidateSourceService,
              private savedSearchService: SavedSearchService) {
  }

  ngOnInit() {

    this.loggedInUser = this.authService.getLoggedInUser();

    //Pick up any previous keyword filter
    const filter = this.localStorageService.get(this.savedStateKey() + this.filterKeySuffix);
    this.searchForm = this.fb.group({
      keyword: [filter]
    });
    this.pageNumber = 1;
    this.pageSize = 50;

    this.subscribeToFilterChanges();
    this.search();
  }

  get keyword(): string {
    return this.searchForm ? this.searchForm.value.keyword : "";
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.sourceType === CandidateSourceType.SavedSearch) {
      //We want to catch changes of sub type (eg Professions/Business to Professions/Healthcare)
      if (changes.savedSearchSubtype) {
        //The very first call of this is before ngOnInit. See https://angular.io/guide/lifecycle-hooks
        //We only want to catch changes after we have started the component.
        if (!changes.savedSearchSubtype.isFirstChange()) {
          //Pick up filter for this new sub type and update search
          const filter = this.localStorageService.get(this.savedStateKey() + this.filterKeySuffix);
          this.searchForm?.controls['keyword'].patchValue(filter);
          this.search();
        }
      }
    }
  }

  getBrowserDisplayString(source: CandidateSource) {
    let s = source.name;
    if (this.searchBy === SearchBy.registeredJob) {
      if (isSavedList(source)) {
        s += "(" + source.sfJobCountry + ") - " + source.sfJobStage;
      }
    }
    return s;
  }

  subscribeToFilterChanges(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.search();
      });
  }

  search() {

    //Remember keyword filter from last search
    this.localStorageService.set(this.savedStateKey() + this.filterKeySuffix, this.keyword);

    let req;
    if (this.sourceType === CandidateSourceType.SavedSearch) {
      req = new SearchSavedSearchRequest();
    } else {
      req = new SearchSavedListRequest();
    }
    req.keyword = this.keyword;
    req.pageNumber = this.pageNumber - 1;
    req.pageSize = this.pageSize;
    req.sortFields = ['name'];
    req.sortDirection = 'ASC';
    req.pageNumber = this.pageNumber - 1;
    req.pageSize = this.pageSize;
    req.sortFields = ['name'];
    req.sortDirection = 'ASC';
    switch (this.searchBy) {
      case SearchBy.mine:
        req.owned = true;
        break;
      case SearchBy.sharedWithMe:
        req.shared = true;
        break;
      case SearchBy.watched:
        req.watched = true;
        break;
      case SearchBy.all:
        req.global = true;
        req.owned = true;
        req.shared = true;
        break;
      case SearchBy.externalLink:
        req.shortName = true;
        break;
      case SearchBy.registeredJob:
        req.registeredJob = true;

        //In this browsing display we want to filter out closed jobs
        req.sfOppClosed = false;

        //We also want to sort with most recent job first - ie descending order of id
        req.sortFields = ['id'];
        req.sortDirection = 'DESC';
        break;
    }
    if (this.savedSearchType !== undefined) {
      if (req instanceof SearchSavedSearchRequest) {
        req.savedSearchType = this.savedSearchType;
        req.savedSearchSubtype = this.savedSearchSubtype;
        req.global = true;
        req.owned = true;
        req.shared = true;
      }
    }

    this.loading = true;

    this.candidateSourceService.searchPaged(req).subscribe(results => {
      this.results = results;

      if (results.content.length > 0) {
        //Selected previously search if any
        const id: number = this.localStorageService.get(this.savedStateKey());
        if (id) {
          this.selectedIndex = indexOfAuditable(id, this.results.content);
          if (this.selectedIndex >= 0) {
            this.selectedSource = this.results.content[this.selectedIndex];
          } else {
            //Select the first search if can't find previous (category of search
            // may have changed)
            this.onSelect(this.results.content[0]);
          }
        } else {
          //Select the first search if no previous
          this.onSelect(this.results.content[0]);
        }
      }

      this.loading = false;
    },
    error => {
      this.error = error;
      this.loading = false;
    });
  }

  /**
   * Called when a particular source (ie list of search) is selected from browse results
   * of the search of sources.
   * @param source Selected candidate source
   */
  onSelect(source: CandidateSource) {
    this.selectedSource = source;

    const id: number = source.id;
    this.localStorageService.set(this.savedStateKey(), id);

    this.selectedIndex = indexOfAuditable(id, this.results.content);
  }

  private savedStateKey() {
    //This key is constructed from the combination of inputs which are associated with each tab
    // in home.component.html
    //This key is used to store the last state associated with each tab.

    //The standard key is "BrowseKey" + the sourceType (SavedSearch or SaveList) +
    // the search by (corresponding to the specific displayed tab)
    let key = this.savedStateKeyPrefix
      + CandidateSourceType[this.sourceType]
      + SearchBy[this.searchBy];

    //If searching by type, also need the saved search type
    if (this.searchBy === SearchBy.type && this.savedSearchType != null) {
      key += this.savedSearchType +
        (this.savedSearchSubtype != null ? '/' + this.savedSearchSubtype : "");
    }
    return key;
  }

  keyDown(event: KeyboardEvent) {
    const oldSelectedIndex = this.selectedIndex;
    switch (event.key) {
      case 'ArrowUp':
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
        }
        break;
      case 'ArrowDown':
        if (this.selectedIndex < this.results.content.length - 1) {
          this.selectedIndex++;
        }
        break;
    }
    if (this.selectedIndex !== oldSelectedIndex) {
      this.onSelect(this.results.content[this.selectedIndex])
    }
  }

  onCopySource(source: CandidateSource) {
    if (isSavedSearch(source)) {
      const editModal = this.modalService.open(CreateUpdateSearchComponent);

      editModal.componentInstance.savedSearch = source;
      editModal.componentInstance.copy = true;

      editModal.result
        .then(() => {
          //Refresh display
          this.search();
        })
        .catch(() => { /* Isn't possible */
        });
    } else {
      //Show modal allowing for list selection
      const modal = this.modalService.open(SelectListComponent);
      modal.componentInstance.action = "Copy";
      modal.componentInstance.title = "Copy to another List";
      modal.componentInstance.excludeList = source;

      modal.result
        .then((selection: TargetListSelection) => {
          this.loading = true;
          const request: CopySourceContentsRequest = {
            savedListId: selection.savedListId,
            newListName: selection.newListName,
            sourceListId: source.id,
            statusUpdateInfo: selection.statusUpdateInfo,
            updateType: selection.replace ? ContentUpdateType.replace : ContentUpdateType.add,
            sfJoblink: source?.sfJoblink

          }
          this.candidateSourceService.copy(source, request).subscribe(
            (targetSource) => {
              //Refresh display which may display new list if there is one.
              this.search();

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
  }

  onDeleteSource(source: CandidateSource) {
    this.loading = true;
    //If shared remove from my shared searches/lists
    if (isSharedWithMe(source, this.authService)) {
      this.removeFromShared(source);
      // Else if it's mine I can delete it from the database
    } else if (isMine(source, this.authService)) {
      this.deleteOwnedSource(source)
      // If it's not shared or it's not mine (e.g. it's global) it cannot be deleted from the TC. No delete icon, but security.
    } else {
      this.error = 'You can not delete this saved search/list.';
      this.loading = false;
    }
  }

  onEditSource(source: CandidateSource) {
    if (isSavedSearch(source)) {
      const editModal = this.modalService.open(CreateUpdateSearchComponent);

      editModal.componentInstance.savedSearch = source;

      editModal.result
        .then(() => {
          //Refresh display
          this.search();
        })
        .catch(() => { /* Isn't possible */
        });
    } else {
      const editModal = this.modalService.open(CreateUpdateListComponent);

      editModal.componentInstance.savedList = source;

      editModal.result
        .then(() => {
          //Refresh display
          this.search();
        })
        .catch(() => { /* Isn't possible */
        });
    }

  }

  onToggleWatch(source: CandidateSource) {
    //Currently only watch save searches
    if (isSavedSearch(source)) {
      this.loading = true;
      if (this.isWatching(source)) {
        this.savedSearchService
          .removeWatcher(source.id, {userId: this.loggedInUser.id})
          .subscribe(result => {
            //Update local copy
            this.updateLocalCandidateSourceCopy(result);
            this.loading = false;
          }, err => {
            this.loading = false;
            this.error = err;
          })
      } else {
        this.savedSearchService
          .addWatcher(source.id, {userId: this.loggedInUser.id})
          .subscribe(result => {
            this.updateLocalCandidateSourceCopy(result);
            this.loading = false;
          }, err => {
            this.loading = false;
            this.error = err;
          })
      }
    }
  }

  private isWatching(source: CandidateSource): boolean {
    return source.watcherUserIds.indexOf(this.loggedInUser.id) >= 0;
  }

  private updateLocalCandidateSourceCopy(source: CandidateSource) {
    const index: number = indexOfAuditable(source.id, this.results.content);
    if (index >= 0) {
      this.results.content[index] = source;
    }
    if (this.selectedIndex === index) {
      this.selectedSource = source;
    }
  }

  private removeFromShared(source: CandidateSource) {
    const loggedInUser = this.authService.getLoggedInUser();

    const removeCandidateSourceModal = this.modalService.open(ConfirmationComponent, {
      centered: true,
      backdrop: 'static'
    });

    removeCandidateSourceModal.componentInstance.message =
      'Are you sure you want to remove "' + source.name + '" from your shared searches or lists?';

    removeCandidateSourceModal.result
      .then((result) => {
        if (result === true) {
          this.candidateSourceService.removeSharedUser(
            source, {userId: loggedInUser.id}).subscribe(
            () => {
              //Refresh display which will remove source if displayed.
              this.search();
              this.loading = false;
            },
            error => {
              this.error = error;
              this.loading = false;
            })
        }
      })
      .catch(() => { });
  }

  private deleteOwnedSource(source: CandidateSource) {
    const deleteCandidateSourceModal = this.modalService.open(ConfirmationComponent, {
      centered: true,
      backdrop: 'static'
    });

    deleteCandidateSourceModal.componentInstance.message =
      'Are you sure you want to delete "' + source.name + '"?';

    deleteCandidateSourceModal.result
      .then((result) => {
        if (result === true) {
          this.candidateSourceService.delete(source).subscribe(
            () => {
              //Refresh display which will remove source if displayed.
              this.search();
              this.loading = false;
            },
            (error) => {
              this.error = error;
              this.loading = false;
            });
        }
      })
      .catch(() => { });
  }

  subtypeChangeEvent($event: SavedSearchTypeSubInfo) {
    this.subtypeChange.emit($event);
  }
}
