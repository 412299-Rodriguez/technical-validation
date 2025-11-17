import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PersonPayload, PersonResponse } from '../../shared/models/person.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private readonly resourceUrl = `${environment.apiBaseUrl}/api/persons`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieves the list of persons from the backend.
   */
  getPersons(): Observable<PersonResponse[]> {
    return this.http.get<PersonResponse[]>(this.resourceUrl);
  }

  /**
   * Updates an existing person.
   */
  updatePerson(id: number, payload: PersonPayload): Observable<PersonResponse> {
    return this.http.put<PersonResponse>(`${this.resourceUrl}/${id}`, payload);
  }
}
