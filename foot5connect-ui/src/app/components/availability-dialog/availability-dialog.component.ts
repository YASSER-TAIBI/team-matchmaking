import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

export interface AvailabilityDialogResult {
  availabilityDate: Date;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-availability-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './availability-dialog.component.html'
})
export class AvailabilityDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AvailabilityDialogComponent, AvailabilityDialogResult | null>);

  form = this.fb.group({
    availabilityDate: [null as Date | null, Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required]
  });

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      availabilityDate: value.availabilityDate as Date,
      startTime: value.startTime as string,
      endTime: value.endTime as string
    });
  }
}
