import {Component, Input, OnInit} from '@angular/core';
import {User} from "../../../model/user";
import {FormBuilder, FormGroup} from "@angular/forms";
import {SearchResults} from "../../../model/search-results";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AuthService} from "../../../services/auth.service";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {CreateCountryComponent} from "../countries/create/create-country.component";
import {EditCountryComponent} from "../countries/edit/edit-country.component";
import {ConfirmationComponent} from "../../util/confirm/confirmation.component";
import {isAdminUser} from "../../../model/base";
import {LinkSavedList} from "../../../model/link-saved-list";
import {LinkSavedListService} from "../../../services/link-saved-list.service";

@Component({
  selector: 'app-search-external-links',
  templateUrl: './search-external-links.component.html',
  styleUrls: ['./search-external-links.component.scss']
})
export class SearchExternalLinksComponent implements OnInit {

  @Input() loggedInUser: User;

  searchForm: FormGroup;
  loading: boolean;
  error: any;
  pageNumber: number;
  pageSize: number;
  results: SearchResults<LinkSavedList>;


  constructor(private fb: FormBuilder,
              private linkSavedListService: LinkSavedListService,
              private modalService: NgbModal,
              private authService: AuthService) {
  }

  ngOnInit() {

    /* SET UP FORM */
    this.searchForm = this.fb.group({
      keyword: [''],
      status: ['active'],
    });
    this.pageNumber = 1;
    this.pageSize = 50;

    this.onChanges();
  }

  onChanges(): void {
    /* SEARCH ON CHANGE*/
    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(res => {
        this.search();
      });
    this.search();
  }

  /* SEARCH FORM */
  search() {
    this.loading = true;
    const request = this.searchForm.value;
    request.pageNumber = this.pageNumber - 1;
    request.pageSize = this.pageSize;
    this.linkSavedListService.search(request).subscribe(results => {
      this.results = results;
      this.loading = false;
    });
  }

  addLink() {
    const addLinkModal = this.modalService.open(CreateCountryComponent, {
      centered: true,
      backdrop: 'static'
    });

    addLinkModal.result
      .then((result) => this.search())
      .catch(() => { /* Isn't possible */ });
  }

  editLink(link: LinkSavedList) {
    const editCountryModal = this.modalService.open(EditCountryComponent, {
      centered: true,
      backdrop: 'static'
    });

    editCountryModal.componentInstance.countryId = link.id;

    editCountryModal.result
      .then((result) => this.search())
      .catch(() => { /* Isn't possible */ });
  }

  deleteLink(link: LinkSavedList) {
    const deleteCountryModal = this.modalService.open(ConfirmationComponent, {
      centered: true,
      backdrop: 'static'
    });

    deleteCountryModal.componentInstance.message = 'Are you sure you want to delete ' + link.link;

    deleteCountryModal.result
      .then((result) => {
        // console.log(result);
        if (result === true) {
          this.linkSavedListService.delete(link.id).subscribe(
            (country) => {
              this.loading = false;
              this.search();
            },
            (error) => {
              this.error = error;
              this.loading = false;
            });
          this.search()
        }
      })
      .catch(() => { /* Isn't possible */ });

  }

  isAnAdmin(): boolean {
    return isAdminUser(this.authService);
  }

}
