import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
export class NewClientFormComponent {
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
}
