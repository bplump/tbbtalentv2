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

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './components/app.component';
import {LandingComponent} from './components/landing/landing.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDatepickerConfig,
  NgbDatepickerI18n,
  NgbModule
} from '@ng-bootstrap/ng-bootstrap';
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {PhraseAppCompiler} from 'ngx-translate-phraseapp';
import {RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module} from 'ng-recaptcha';

import {RegistrationLandingComponent} from './components/register/landing/registration-landing.component';
import {RegistrationContactComponent} from './components/register/contact/registration-contact.component';
import {RegistrationPersonalComponent} from './components/register/personal/registration-personal.component';
import {RegistrationCandidateOccupationComponent} from './components/register/candidate-occupation/registration-candidate-occupation.component';
import {RegistrationWorkExperienceComponent} from './components/register/work-experience/registration-work-experience.component';
import {RegistrationEducationComponent} from './components/register/education/registration-education.component';
import {CandidateEducationFormComponent} from './components/common/candidate-education-form/candidate-education-form.component';
import {RegistrationLanguageComponent} from './components/register/language/registration-language.component';
import {RegistrationCertificationsComponent} from './components/register/certifications/registration-certifications.component';
import {RegistrationAdditionalInfoComponent} from './components/register/additional-info/registration-additional-info.component';
import {LocalStorageModule} from 'angular-2-local-storage';
import {JwtInterceptor} from './services/jwt.interceptor';
import {LanguageInterceptor} from './services/language.interceptor';
import {LoginComponent} from './components/account/login/login.component';
import {HomeComponent} from './components/home/home.component';
import {ErrorInterceptor} from './services/error.interceptor';
import {ResetPasswordComponent} from './components/account/reset-password/reset-password.component';
import {ChangePasswordComponent} from './components/account/change-password/change-password.component';
import {HeaderComponent} from './components/header/header.component';
import {RegisterComponent} from './components/register/register.component';
import {RegistrationFooterComponent} from './components/register/registration-footer/registration-footer.component';
import {CandidateJobExperienceFormComponent} from './components/common/candidate-job-experience-form/candidate-job-experience-form.component';
import {CandidateJobExperienceCardComponent} from './components/common/candidate-job-experience-card/candidate-job-experience-card.component';
import {ErrorComponent} from './components/common/error/error.component';
import {LoadingComponent} from './components/common/loading/loading.component';
import {CandidateProfileComponent} from './components/profile/view/tab/profile/candidate-profile.component';
import {FormControlErrorComponent} from './components/common/form-control-error/form-control-error.component';
import {CandidateCertificationCardComponent} from './components/common/candidate-certification-card/candidate-certification-card.component';
import {EditCandidateComponent} from './components/profile/edit/edit-candidate.component';
import {CandidateOccupationCardComponent} from './components/common/candidate-occupation-card/candidate-occupation-card.component';
import {CandidateEducationCardComponent} from './components/common/candidate-education-card/candidate-education-card.component';
import {CandidateLanguageCardComponent} from './components/common/candidate-language-card/candidate-language-card.component';
import {CandidateAttachmentsComponent} from './components/common/candidate-attachments/candidate-attachments.component';
import {FileUploadComponent} from './components/common/file-upload/file-upload.component';
import {InputFilterDirective} from './directives/input-filter.directive';
import {CustomDateAdapter, CustomDateParserFormatter} from './util/date-adapter/ngb-date-adapter';
import {UserPipe} from './pipes/user.pipe';
import {TrimPipe} from './pipes/trim.pipe';
import {MonthPickerComponent} from './components/common/month-picker/month-picker.component';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faCalendar,
  faCheck,
  faChevronDown,
  faChevronUp,
  faEdit,
  faEllipsisH,
  faExternalLinkAlt,
  faFolderOpen,
  faGlobe,
  faQuestion,
  faQuestionCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import {DeleteOccupationComponent} from './components/register/candidate-occupation/delete/delete-occupation.component';
import {CandidateCertificationFormComponent} from './components/common/candidate-certification-form/candidate-certification-form.component';
import {DownloadCvComponent} from './components/common/download-cv/download-cv.component';
import {RedirectGuard} from './services/redirect.guard';
import {LanguageLoader} from "./services/language.loader";
import {faSpinner} from "@fortawesome/free-solid-svg-icons/faSpinner";
import {RegistrationUploadFileComponent} from './components/register/upload-file/registration-upload-file.component';
import {DatePickerComponent} from './components/common/date-picker/date-picker.component';
import {CustomDatepickerI18n} from "./util/custom-date-picker";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {NgSelectModule} from "@ng-select/ng-select";
import {ViewCandidateComponent} from './components/profile/view/view-candidate.component';
import {CandidateTasksComponent} from './components/profile/view/tab/tasks/candidate-tasks.component';
import {CandidateTaskComponent} from './components/profile/view/tab/tasks/task/candidate-task.component';
import {DatePipe} from "@angular/common";
import {ExtendDatePipe} from "./util/date-adapter/extend-date-pipe";
import {ViewSimpleTaskComponent} from './components/profile/view/tab/tasks/task/simple/view-simple-task.component';
import {ViewQuestionTaskComponent} from './components/profile/view/tab/tasks/task/question/view-question-task.component';
import {ViewUploadTaskComponent} from './components/profile/view/tab/tasks/task/upload/view-upload-task.component';

//This is not used now - but is left here to show how the standard translation loading works.
//See https://github.com/ngx-translate/core#configuration
//See doc for LanguageLoader for the reasons why we do what we do.
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LandingComponent,
    RegistrationLandingComponent,
    RegistrationContactComponent,
    RegistrationPersonalComponent,
    RegistrationCandidateOccupationComponent,
    RegistrationWorkExperienceComponent,
    RegistrationEducationComponent,
    CandidateEducationFormComponent,
    RegistrationLanguageComponent,
    RegistrationCertificationsComponent,
    RegistrationAdditionalInfoComponent,
    LoginComponent,
    HomeComponent,
    ResetPasswordComponent,
    ChangePasswordComponent,
    RegisterComponent,
    RegistrationFooterComponent,
    CandidateJobExperienceFormComponent,
    CandidateJobExperienceCardComponent,
    ErrorComponent,
    LoadingComponent,
    CandidateProfileComponent,
    FormControlErrorComponent,
    CandidateCertificationCardComponent,
    EditCandidateComponent,
    CandidateOccupationCardComponent,
    CandidateEducationCardComponent,
    CandidateLanguageCardComponent,
    CandidateAttachmentsComponent,
    FileUploadComponent,
    InputFilterDirective,
    UserPipe,
    TrimPipe,
    MonthPickerComponent,
    DeleteOccupationComponent,
    CandidateCertificationFormComponent,
    DownloadCvComponent,
    RegistrationUploadFileComponent,
    DatePickerComponent,
    ViewCandidateComponent,
    CandidateTasksComponent,
    CandidateTaskComponent,
    ExtendDatePipe,
    ViewSimpleTaskComponent,
    ViewQuestionTaskComponent,
    ViewUploadTaskComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    RecaptchaV3Module,
    LocalStorageModule.forRoot({
      prefix: 'tbb-candidate-portal',
      storageType: 'localStorage'
    }),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useClass: LanguageLoader
        // Below is the standard loader which finds json translation files in assets/i18n
        //See https://github.com/ngx-translate/core#configuration
        //See doc for LanguageLoader for the reasons why we do what we do.
        // useFactory: HttpLoaderFactory,
        // deps: [HttpClient]
      },
      // Support for in context Phrase translations
      // See https://phrase.com/blog/posts/angular-l10n-in-context-translation-editing/
      compiler: {
        provide: TranslateCompiler,
        useClass: PhraseAppCompiler
      }
    }),
    FontAwesomeModule,
    NgSelectModule
  ],
  providers: [
    {provide: RedirectGuard},
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: RECAPTCHA_V3_SITE_KEY, useValue: '6Lc_97cZAAAAAIDqR7gT3h_ROGU6P7Jif-wEk9Vu'},
    {provide: NgbDateAdapter, useClass: CustomDateAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter},
    {provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n},
    DatePipe

  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(private datepickerConfig: NgbDatepickerConfig, library: FaIconLibrary) {
    this.datepickerConfig.minDate = {year: 1950, month: 1, day: 1};
    library.addIcons(
      faEdit,
      faSpinner,
      faChevronDown,
      faChevronUp,
      faEllipsisH,
      faCalendar,
      faExternalLinkAlt,
      faGlobe,
      faCheck,
      faQuestion,
      faTimes,
      faArrowLeft,
      faQuestionCircle,
      faFolderOpen
    );
  }
}
