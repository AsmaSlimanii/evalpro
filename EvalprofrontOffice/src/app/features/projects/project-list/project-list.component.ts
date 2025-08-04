import { Component, OnInit } from '@angular/core';
import { FormService } from '../../../core/services/form.service';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  dossiers: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  pages: number[] = [];

  constructor(
    private formService: FormService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDossiers(); // ✅ plus besoin d'email
  }

  loadDossiers(): void {
    this.formService.getUserDossiers().subscribe({
      next: (data: any[]) => {
        console.log('Dossiers récupérés:', data);
        this.dossiers = data;
        this.totalPages = Math.ceil(this.dossiers.length / this.itemsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des dossiers:', err);
      }
    });
  }


  get paginatedDossiers(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.dossiers.slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  deleteDossier(id: number, event: Event): void {
    event.preventDefault();
  Swal.fire({
    title: 'Souhaitez-vous réellement supprimer ce projet?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Oui, supprimer',
    cancelButtonText: 'Annuler',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      console.log("Tentative de suppression du dossier", id);
      this.formService.deleteDossier(id).subscribe({
        next: () => {
          console.log('Suppression réussie');
          this.dossiers = this.dossiers.filter(d => d.id !== id);
          this.totalPages = Math.ceil(this.dossiers.length / this.itemsPerPage);
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

          Swal.fire({
            title: 'Projet supprimé',
            text: 'Le projet a été supprimé avec succès.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          Swal.fire('Erreur', 'Erreur lors de la suppression du dossier.', 'error');
        }
      });
    }
  });
}



  getStepKeys(steps: { [key: string]: number }): string[] {
    return Object.keys(steps);
  }
}
