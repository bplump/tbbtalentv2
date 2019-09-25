import {Profession} from "./profession";
import {Education} from "./education";
import {Country} from "./country";
import {Nationality} from "./nationality";
import {WorkExperience} from "./work-experience";
import {Certification} from "./certification";
import {CandidateLanguage} from "./candidate-language";

export interface Candidate {
  id: number;
  username: string;
  candidateNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  gender: string;
  dob: string;
  professions: Profession[];
  country: Country;
  city: string;
  yearOfArrival: number;
  nationality: Nationality;
  registeredWithUN: boolean;
  workExperiences: WorkExperience[];
  certifications: Certification[];
  candidateLanguages: CandidateLanguage[];
  registrationId: string;
  educationLevel: string;
  educations: Education[];
  additionalInfo: string;
}
