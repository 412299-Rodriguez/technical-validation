/**
 * Form used to register or edit a person along with risk details and attributes.
 */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Person } from '../../../../shared/models/person.model';
import { PersonService } from '../../services/person.service';

type AttributeFormGroup = FormGroup<{
  key: FormControl<string>;
  value: FormControl<string>;
}>;

type RiskLevel = NonNullable<Person['riskLevel']>;

type PersonForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  documentNumber: FormControl<string>;
  birthDate: FormControl<string>;
  riskLevel: FormControl<RiskLevel>;
  attributes: FormArray<AttributeFormGroup>;
}>;

@Component({
  standalone: true,
  selector: 'app-person-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './person-form.component.html',
  styleUrls: ['./person-form.component.scss']
})
export class PersonFormComponent {
  /** Reactive representation of the person form. */
  readonly form: PersonForm;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly personService: PersonService
  ) {
    this.form = this.fb.nonNullable.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      documentNumber: ['', Validators.required],
      birthDate: ['', Validators.required],
      riskLevel: ['medium' as RiskLevel, Validators.required],
      attributes: this.fb.array<AttributeFormGroup>([])
    });
  }

  /** Convenience accessor to the dynamic attributes array. */
  get attributes(): FormArray<AttributeFormGroup> {
    return this.form.controls.attributes;
  }

  addAttribute(): void {
    this.attributes.push(this.createAttributeGroup());
  }

  removeAttribute(index: number): void {
    this.attributes.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { attributes, ...base } = this.form.getRawValue();
    const payload: Omit<Person, 'id'> = {
      ...base,
      attributes
    };

    this.personService.savePerson(payload);
    this.router.navigate(['/persons']);
  }

  private createAttributeGroup(): AttributeFormGroup {
    return this.fb.nonNullable.group({
      key: ['', Validators.required],
      value: ['', Validators.required]
    });
  }
}
