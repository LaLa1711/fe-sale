import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-login2',
  templateUrl: './login2.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./login2.component.css']
})
export class Login2Component implements OnInit {

  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    console.log(this.email);
  }

  login(): void {
    console.log(this.email);
    console.log(this.password);
    this.authService.login(this.email, this.password);
    this.router.navigate(['/admin']);
  }

}
