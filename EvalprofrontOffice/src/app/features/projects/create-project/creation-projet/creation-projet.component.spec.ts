import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreationProjetComponent } from './creation-projet.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreationProjetComponent', () => {
  let component: CreationProjetComponent;
  let fixture: ComponentFixture<CreationProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreationProjetComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreationProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
