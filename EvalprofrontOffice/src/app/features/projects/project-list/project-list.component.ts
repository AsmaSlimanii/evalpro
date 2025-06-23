// project-list.component.ts
import { Component, OnInit, TrackByFunction } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DossierService } from '../../../core/services/dossier.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
deleteDossier(arg0: any) {
throw new Error('Method not implemented.');
}
  dossiers: any[] = [];
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dossierService: DossierService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentPage = +params['page'] || 1;
      this.loadDossiers();
    });
  }

  loadDossiers(): void {
  this.dossierService.getPaginatedDossiers(this.currentPage, 5).subscribe({
    next: (res) => {
      // Si le backend renvoie juste un tableau
      if (Array.isArray(res)) {
        this.dossiers = res;
        this.totalPages = 1; // pas de pagination réelle
      } else {
        this.dossiers = res.content || [];
        this.totalPages = res.totalPages || 1;
      }
    },
    error: (err) => console.error('Erreur chargement dossiers', err)
  });
}


  goToPage(page: number): void {
    this.router.navigate([], {
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }

  
}
