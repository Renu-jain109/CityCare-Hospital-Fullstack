import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DynamicForm } from '../../ui/dynamic-form/dynamic-form';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatDialogModule, MatButtonModule, CommonModule, DynamicForm, ReactiveFormsModule],
  templateUrl: './confirmation-dialog.html',
  styleUrls: ['./confirmation-dialog.css'],
})
export class ConfirmationDialog {
  doctorForm: FormGroup = new FormGroup({});

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    if (this.data.fields && this.data.buttons) {
      this.doctorForm = this.fb.group({});
    }
  }

  onSubmit(formData: any) {
    this.dialogRef.close(formData);
  }
}
