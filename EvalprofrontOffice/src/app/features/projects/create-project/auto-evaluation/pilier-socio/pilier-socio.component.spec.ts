import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PilierSocioComponent } from './pilier-socio.component';

describe('PilierSocioComponent', () => {
  let component: PilierSocioComponent;
  let fixture: ComponentFixture<PilierSocioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PilierSocioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PilierSocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
