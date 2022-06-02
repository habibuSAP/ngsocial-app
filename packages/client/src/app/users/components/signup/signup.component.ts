import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core';
import { RegisterResponse } from 'src/app/shared';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {

  errorMessage: string | null = '';
  private registerSubscription: Subscription | null = null;
  form: FormGroup = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }



  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.registerSubscription) {
      this.registerSubscription.unsubscribe();
    }
  }

  onSubmit() {
    const { fullName, email, username, password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    if (!this.form.invalid) {
      this.errorMessage = 'Please enter valid information';
      return;
    }
    this.registerSubscription = this.authService.register(fullName, email, username, password).subscribe(
      {
        next: (response: RegisterResponse | null | undefined) => {
          const saveUserId = response?.register.user.id;
          this.snackBar.open('User registered successfully', 'Ok', { duration: 5 * 1000 });
          if (saveUserId) {
            this.router.navigateByUrl(`/users/profile/${saveUserId}`);
          }
        },
        error: (err: any | null | undefined) => {
          this.errorMessage = err.message;
          this.snackBar.open(err.error.message, 'Ok', { duration: 5 * 1000 });
        }
      }
    )
  }

}
