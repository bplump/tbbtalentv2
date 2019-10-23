import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {CandidateService} from "../../../services/candidate.service";
import {AuthService} from "../../../services/auth.service";
import {Candidate} from "../../../model/candidate";
import {RegistrationService} from "../../../services/registration.service";

@Component({
  selector: 'app-registration-contact',
  templateUrl: './registration-contact.component.html',
  styleUrls: ['./registration-contact.component.scss']
})
export class RegistrationContactComponent implements OnInit {

  form: FormGroup;
  error: any;
  // Form states
  loading: boolean;
  saving: boolean;
  // Candidate data
  authenticated: boolean;
  candidate: Candidate;

  constructor(private fb: FormBuilder,
              private router: Router,
              private candidateService: CandidateService,
              private authService: AuthService,
              private registrationService: RegistrationService) { }

  ngOnInit() {
    this.authenticated = false;
    this.loading = true;
    this.candidate = null;
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      whatsapp: [''],
      // username: ['']
    });

    if (this.authService.isAuthenticated()) {
      this.authenticated = true;
      this.candidateService.getCandidateContact().subscribe(
        (candidate) => {
          this.candidate = candidate;
          this.form.patchValue({
            email: candidate.user ? candidate.user.email : '',
            phone: candidate.phone,
            whatsapp: candidate.whatsapp,
            //username: candidate.user ? response.user.username : ''
          });
          this.loading = false;
        },
        (error) => {
          this.error = error;
          this.loading = false;
        }
      );
    } else {
      // The user has not registered - add the password fields to the reactive form
      this.form.addControl('password', new FormControl('', [Validators.required, Validators.minLength(8)]));
      this.form.addControl('passwordConfirmation', new FormControl('', [Validators.required, Validators.minLength(8)]));
      this.loading = false;
    }
  }

  save() {
    this.saving = true;
    if (this.authService.isAuthenticated()) {

      // If the candidate hasn't changed anything, skip the update service call
      if (this.form.pristine) {
        this.registrationService.next();
        return;
      }

      // The user has already registered and is revisiting this page
      this.candidateService.updateCandidateContact(this.form.value).subscribe(
        (response) => {
          this.registrationService.next();
        },
        (error) => {
          this.error = error;
          this.saving = false;
        }
      );
    } else {
      // The user has not yet registered - create an account for them
      this.authService.register(this.form.value).subscribe(
        (response) => {
          this.registrationService.next();
        },
        (error) => {
          this.error = error;
          this.saving = false;
        }
      );
    }
  }

  get formValid() {
    const value = this.form.value;
    const control = this.form.controls;

    const hasContactField = (value.email && control.email.valid) || value.phone || value.whatsapp;
    const hasPassword = !this.authenticated && control.password.valid && control.passwordConfirmation.valid || true;
    return hasContactField && hasPassword;
  }
}
