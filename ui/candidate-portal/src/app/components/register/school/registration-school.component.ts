import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {years} from "../../../model/years";
import {Education} from "../../../model/education";
import {CandidateService} from "../../../services/candidate.service";
import {EducationService} from "../../../services/education.service";
import {Country} from "../../../model/country";
import {CountryService} from "../../../services/country.service";

@Component({
  selector: 'app-registration-school',
  templateUrl: './registration-school.component.html',
  styleUrls: ['./registration-school.component.scss']
})
export class RegistrationSchoolComponent implements OnInit {

  form: FormGroup;
  error: any;
  loading: boolean;
  saving: boolean;
  countries: Country[];
  years: number[];
  educations: Education[];
  school: Education[];

  constructor(private fb: FormBuilder,
              private router: Router,
              private candidateService: CandidateService,
              private educationService: EducationService,
              private countryService: CountryService) { }

  ngOnInit() {
    this.educations = [];
    this.countries = [];
    this.years = years;
    this.saving = false;
    this.loading = true;

    this.form = this.fb.group({
      educationType: ['School'],
      courseName: [''],
      country: ['', Validators.required],
      institution: ['', Validators.required],
      lengthOfCourseYears: [''],
      dateCompleted: [''],
      completedSchool: ['', Validators.required]
     });

     /* Load & update the candidate data */
     this.candidateService.getCandidateEducations().subscribe(
       (candidate) => {
         this.educations = candidate.educations || [];

         /* filter for the correct education type for the component */
         this.school = this.educations.filter(e => e.educationType == "School");
         if(this.school.length !== 0){
          this.form.patchValue({
             educationType: this.school[0].educationType,
             courseName: this.school[0].courseName,
             country: this.school[0].country.id,
             institution: this.school[0].institution,
             lengthOfCourseYears: this.school[0].lengthOfCourseYears,
             dateCompleted: this.school[0].dateCompleted,
           });
         }

        /* Load the countries */
         this.countryService.listCountries().subscribe(
         (response) => {
           this.countries = response;
           this.loading = false;
           },
         (error) => {
           this.error = error;
           this.loading = false;
           }
         );
       },

       (error) => {
         this.error = error;
         this.loading = false;
       }
     );
   };

   save() {
     this.saving = true;
     /* CREATE if no education type exists in education table*/

     if(this.school.length == 0){
       this.educationService.createEducation(this.form.value).subscribe(
         (response) => {
            this.educations.push(response);
            this.saving = false;
            this.router.navigate(['register', 'language']);
         },
         (error) => {
            this.error = error;
            this.saving = false;
         },
       );

     /* UPDATE if education type exists */

     } else {
       this.educationService.updateEducation(this.form.value).subscribe(
         (response) => {
            this.router.navigate(['register', 'language']);
         },
         (error) => {
            this.error = error;
            this.saving = false;
         }
       );
     }
   }

}
