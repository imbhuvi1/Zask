import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, 
    MatInputModule, MatButtonModule, MatIconModule, RouterModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./forgot-password.component.scss'] // Reusing styles
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  resetForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  resetToken = '';
  isLoading = signal(false);
  isSuccess = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'];
      if (!this.resetToken) {
        this.errorMessage.set('Invalid or missing password reset token.');
      }
    });
  }

  onSubmit() {
    if (this.resetForm.valid && this.resetToken) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const newPassword = this.resetForm.get('newPassword')?.value;
      
      this.http.post(`${environment.apiUrl}/auth/reset-password`, { 
        token: this.resetToken, 
        newPassword 
      }).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.isSuccess.set(true);
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Failed to reset password.');
          this.isLoading.set(false);
        }
      });
    }
  }
}
