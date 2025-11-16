import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { PersonResponse } from '../../../shared/models/person.model';

/**
 * Reactive form embedded inside the modal to capture the data for a new client.
 */
@Component({
  standalone: true,
  selector: 'app-new-client-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-client-form.component.html',
  styleUrls: ['./new-client-form.component.css']
})
export class NewClientFormComponent implements OnChanges {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() client: PersonResponse | null = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<PersonResponse>();

  readonly form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(150)]],
      identification: ['', [Validators.required, Validators.maxLength(50)]],
      age: [null, [Validators.required, Validators.min(0), Validators.max(120)]],
      gender: ['', [Validators.required]],
      active: [true],
      drives: [false],
      wearsGlasses: [false],
      diabetic: [false],
      otherDisease: ['', [Validators.maxLength(255)]],
      additionalAttributes: this.fb.array([])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client']) {
      this.applyClientData();
    }
  }

  get fullName() {
    return this.form.get('fullName');
  }
  get identification() {
    return this.form.get('identification');
  }
  get age() {
    return this.form.get('age');
  }
  get gender() {
    return this.form.get('gender');
  }
  get active() {
    return this.form.get('active');
  }
  get drives() {
    return this.form.get('drives');
  }
  get wearsGlasses() {
    return this.form.get('wearsGlasses');
  }
  get diabetic() {
    return this.form.get('diabetic');
  }
  get otherDisease() {
    return this.form.get('otherDisease');
  }
  get additionalAttributes(): FormArray {
    return this.form.get('additionalAttributes') as FormArray;
  }
  get additionalAttributeGroups(): FormGroup[] {
    return this.additionalAttributes.controls as FormGroup[];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    console.log('New client payload', this.form.value);
    // TODO: integrate with backend API once available.
    this.save.emit(this.form.value as PersonResponse);
  }

  onAddAttribute(): void {
    this.additionalAttributes.push(
      this.fb.group({
        key: ['', [Validators.required, Validators.maxLength(50)]],
        value: ['', [Validators.required, Validators.maxLength(100)]]
      })
    );
  }

  removeAttribute(index: number): void {
    this.additionalAttributes.removeAt(index);
  }

  private applyClientData(): void {
    this.additionalAttributes.clear();

    if (this.client) {
      this.form.patchValue({
        fullName: this.client.fullName,
        identification: this.client.identification,
        age: this.client.age,
        gender: this.client.gender,
        active: this.client.active,
        drives: this.client.drives,
        wearsGlasses: this.client.wearsGlasses,
        diabetic: this.client.diabetic,
        otherDisease: this.client.otherDisease ?? ''
      });

      (this.client.additionalAttributes ?? []).forEach((attr) => {
        this.additionalAttributes.push(
          this.fb.group({
            key: [attr.key ?? '', [Validators.required, Validators.maxLength(50)]],
            value: [attr.value ?? '', [Validators.required, Validators.maxLength(100)]]
          })
        );
      });
    } else {
      this.form.reset({
        fullName: '',
        identification: '',
        age: null,
        gender: '',
        active: true,
        drives: false,
        wearsGlasses: false,
        diabetic: false,
        otherDisease: ''
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
