/**
 * Detail view for a specific person, exposing base info and attributes.
 */
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Person } from '../../../../shared/models/person.model';
import { PersonService } from '../../services/person.service';

@Component({
  standalone: true,
  selector: 'app-person-detail',
  imports: [CommonModule, RouterModule, DatePipe, AsyncPipe],
  templateUrl: './person-detail.component.html',
  styleUrls: ['./person-detail.component.scss']
})
export class PersonDetailComponent implements OnInit {
  person$!: Observable<Person | undefined>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly personService: PersonService
  ) {}

  ngOnInit(): void {
    this.person$ = this.personService.getPerson(this.route.snapshot.paramMap.get('id') || '');
  }
}
