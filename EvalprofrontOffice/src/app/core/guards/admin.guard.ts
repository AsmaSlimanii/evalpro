import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'; // adapte le chemin si besoin

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.auth.isAdmin()) return true;
    this.router.navigateByUrl('/forbidden'); // ou '/connexion'
    return false;
  }
}
