import { AdditionalAttribute } from './additional-attribute.model';

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  riskLevel?: 'low' | 'medium' | 'high';
  attributes?: AdditionalAttribute[];
}

/**
 * Response model used across the dashboard to describe clients/persons.
 */
export interface PersonResponse {
  id: number;
  fullName: string;
  identification: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  active: boolean;
  drives: boolean;
  wearsGlasses: boolean;
  diabetic: boolean;
  otherDisease: string | null;
  additionalAttributes: AdditionalAttribute[];
}

export interface PersonPayload {
  fullName: string;
  identification: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  active: boolean;
  drives: boolean;
  wearsGlasses: boolean;
  diabetic: boolean;
  otherDisease: string | null;
  additionalAttributes?: AdditionalAttribute[];
}
