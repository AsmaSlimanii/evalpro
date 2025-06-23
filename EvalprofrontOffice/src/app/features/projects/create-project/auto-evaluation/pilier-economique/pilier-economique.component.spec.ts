import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PilierEconomiqueComponent } from './pilier-economique.component';

describe('PilierEconomiqueComponent', () => {
  let component: PilierEconomiqueComponent;
  let fixture: ComponentFixture<PilierEconomiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PilierEconomiqueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PilierEconomiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
