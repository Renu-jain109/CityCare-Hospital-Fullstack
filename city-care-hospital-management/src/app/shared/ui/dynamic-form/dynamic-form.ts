import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../button/button';
import { DynamicFormInterface } from '../interfaces/dynamic-form-interface';
import { ButtonInterface } from '../interfaces/button-interface';

@Component({
  selector: 'app-dynamic-form',
  imports: [ReactiveFormsModule, CommonModule, Button],
  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.css',
})
export class DynamicForm implements OnInit {
  @Input() fields: DynamicFormInterface[] = [];
  @Input() initialData: any = null;
  @Input() buttons: ButtonInterface[] = [];
  @Output() submitForm = new EventEmitter<any>();
  @Output() fieldChange = new EventEmitter<{ key: string; value: any }>();
  @Input() form!: FormGroup;

  constructor(private fb: FormBuilder) { };



  ngOnInit(): void {

    if (!this.fields?.length) {
      return;
    }

    this.fields.forEach(field => {

      if (!this.form.contains(field.key)) {

        const validators = this.getValidatorsForField(field);

        const initialValue = field.value !== undefined ? field.value : '';

        this.form.addControl(
          field.key,
          new FormControl(initialValue, validators)
        );

      }

    });

    // Subscribe to field changes and emit fieldChange event
    this.fields.forEach(field => {
      const control = this.form.get(field.key);
      if (control) {
        control.valueChanges.subscribe(value => {
          this.fieldChange.emit({ key: field.key, value });
        });
      }
    });

  }

  // Helper method to get validators based on field type and key
  private getValidatorsForField(field: DynamicFormInterface) {
    const validators = [];

    // Always add required validator if field is required
    if (field.required) {
      validators.push(Validators.required);
    }

    // Email validation
    if (field.key === 'email' || field.type === 'email') {
      validators.push(Validators.email);
    }

    // Mobile number validation (10 digits)
    if (field.key === 'mobile' || field.key === 'contactNumber') {
      validators.push(Validators.pattern(/^[0-9]{10}$/));
    }

    // Patient name validation (starts with capital letter)
    if (field.key === 'patientName') {
      validators.push(Validators.pattern(/^[A-Z][a-zA-Z ]*$/));
    }

    // Doctor name validation (starts with capital letter)
    if (field.key === 'doctorName') {
      validators.push(Validators.pattern(/^[A-Z][a-zA-Z ]*$/));
    }

    // Department name validation
    if (field.key === 'departmentName') {
      validators.push(Validators.pattern(/^[A-Za-z\s]+$/));
    }

    // Number validation for numeric fields
    if (field.type === 'number') {
      validators.push(Validators.min(0));
    }

    // Experience validation
    if (field.key === 'experience') {
      validators.push(Validators.pattern(/^[0-9]+$/));
    }

    return validators;
  }

  // isArray(value: any): boolean {
  //   return Array.isArray(value);
  // }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitForm.emit(this.form.value);
  }

}
