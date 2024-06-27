// import {Injectable} from '@angular/core';
// import {Router} from '@angular/router';
// import {HttpClient} from '@angular/common/http';
// import {throwError} from 'rxjs';
// import {catchError} from 'rxjs/operators';
//
//
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//
//   private apiUrl = 'http://localhost:6969';
//
//   constructor(private http: HttpClient, private router: Router) {
//   }
//
//
//   // tslint:disable-next-line:typedef
//   login(email: string, password: string) {
//     return this.http.post<any>(`${this.apiUrl}/auth/login`, {email, password})
//       .pipe(
//         catchError((error) => {
//           return throwError(error);
//         })
//       )
//       .subscribe(
//         (response) => {
//           localStorage.setItem('token', response.jwtToken);
//           this.router.navigate(['/dashboard']);
//         }
//       );
//   }
//
//   // tslint:disable-next-line:typedef
//   logout() {
//     localStorage.removeItem('token');
//     this.router.navigate(['/login']);
//   }
//
//   isAuthenticated(): boolean {
//     return !!localStorage.getItem('token');
//   }
//
//   getToken(): string | null {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem('token');
//     } else {
//       console.warn('localStorage is not available');
//       return null;
//     }
//   }
// }
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:6969';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        catchError((error) => {
          return throwError(error);
        })
      )
      .subscribe(
        (response) => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.jwtToken);
          }
          this.router.navigate(['/dashboard']);
        }
      );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  getToken(): string {
    // @ts-ignore
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }
}
