import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Person } from '../../../shared/models/person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private readonly persons$ = new BehaviorSubject<Person[]>([
    {
      id: '1',
      firstName: 'Max',
      lastName: 'Power',
      documentNumber: 'ABC123',
      birthDate: '1990-01-01',
      riskLevel: 'low',
      attributes: [{ key: 'Nacionalidad', value: 'AR' }]
    }
  ]);

  getPersons(): Observable<Person[]> {
    return this.persons$.asObservable();
  }

  getPerson(id: string): Observable<Person | undefined> {
    return this.getPersons().pipe(map((persons) => persons.find((person) => person.id === id)));
  }

  savePerson(partial: Omit<Person, 'id'>): void {
    const current = this.persons$.value;
    const newPerson: Person = { ...partial, id: crypto.randomUUID() };
    this.persons$.next([...current, newPerson]);
  }
}