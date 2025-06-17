import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequeteFinancementComponent } from './requete-financement.component';

describe('RequeteFinancementComponent', () => {
  let component: RequeteFinancementComponent;
  let fixture: ComponentFixture<RequeteFinancementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequeteFinancementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequeteFinancementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
