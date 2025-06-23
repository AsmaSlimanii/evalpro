import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PilierEnvironnementalComponent } from './pilier-environnemental.component';

describe('PilierEnvironnementalComponent', () => {
  let component: PilierEnvironnementalComponent;
  let fixture: ComponentFixture<PilierEnvironnementalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PilierEnvironnementalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PilierEnvironnementalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
