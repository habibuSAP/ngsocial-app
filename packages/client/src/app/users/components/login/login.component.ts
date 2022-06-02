import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core';
import { LoginResponse } from 'src/app/shared';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  form: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });
  errorMessage: string | null = '';
  private loginSubcription: Subscription | null = null;


  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }


  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    if (this.loginSubcription) {
      this.loginSubcription.unsubscribe();
    }
  }

  onSubmit() {
    const { email, password } = this.form.value;
    if (!this.form.invalid) {
      this.errorMessage = 'Please enter valid email and password';
      return;
    }
    this.loginSubcription = this.authService.login(email, password).subscribe(
      {
        next: (response: LoginResponse | null | undefined) => {
          const saveUserId = response?.signIn.user?.id;
          this.snackBar.open('User logged in successfully', 'Ok', { duration: 5 * 1000 });
          if (saveUserId) {
            this.router.navigateByUrl(`/users/profile/${saveUserId}`);
          }
        },
        error: (err: any | null | undefined) => {
          this.errorMessage = err?.error?.message;
          this.snackBar.open(err.error.errorMessage, 'Ok', { duration: 5 * 1000 });
        }
      }
    );
  }

}
