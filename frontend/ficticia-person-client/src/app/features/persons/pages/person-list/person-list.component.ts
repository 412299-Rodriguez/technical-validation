/**
 * Listing for registered persons with quick access to details and creation flow.
 */
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Person } from '../../../../shared/models/person.model';
import { PersonService } from '../../services/person.service';

@Component({
  standalone: true,
  selector: 'app-person-list',
  imports: [CommonModule, RouterModule, AsyncPipe],
  templateUrl: './person-list.component.html',
  styleUrls: ['./person-list.component.scss']
})
export class PersonListComponent implements OnInit {
  persons$!: Observable<Person[]>;

  constructor(private readonly personService: PersonService) {}

  ngOnInit(): void {
    this.persons$ = this.personService.getPersons();
  }
}
