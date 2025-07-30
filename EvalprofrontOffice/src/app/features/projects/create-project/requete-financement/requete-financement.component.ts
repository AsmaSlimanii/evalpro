import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-requete-financement',
  templateUrl: './requete-financement.component.html',
  styleUrls: ['./requete-financement.component.scss']
})
export class RequeteFinancementComponent implements OnInit {
  dossierId: string | null = null;

  progress = {
    profil: 0,
    entreprise: 0,
    projet: 0
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.dossierId = this.route.snapshot.paramMap.get('id') || localStorage.getItem('dossierId');
    if (!this.dossierId) {
      this.router.navigate(['/projects/create']);
      return;
    }

    // Appelle fictif si tu veux gérer la progression comme l'étape 3
    // this.loadProgress();
  }

  navigateTo(section: 'profil' | 'entreprise' | 'projet'): void {
    if (this.dossierId) {
      this.router.navigate([`/projects/edit/${this.dossierId}/step4/${section}`]);
    }
  }

  goBack(): void {
    this.router.navigate(['/projects/create']);
  }
}
