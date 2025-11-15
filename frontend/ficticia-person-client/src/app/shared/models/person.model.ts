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