import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, 
    MatInputModule, MatButtonModule, MatIconModule, RouterModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = signal(false);
  isSent = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const email = this.forgotForm.get('email')?.value;
      
      this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isSent.set(true);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Failed to send reset link.');
          this.isLoading.set(false);
        }
      });
    }
  }
}
