import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-authenticated',
  templateUrl: './home-authenticated.component.html',
  styleUrls: ['./home-authenticated.component.scss']
})
export class HomeAuthenticatedComponent {
  constructor(private router: Router) {}

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  
}
