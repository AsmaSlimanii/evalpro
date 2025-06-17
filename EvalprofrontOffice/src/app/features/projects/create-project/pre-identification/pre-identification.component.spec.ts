import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreIdentificationComponent } from './pre-identification.component';

describe('PreIdentificationComponent', () => {
  let component: PreIdentificationComponent;
  let fixture: ComponentFixture<PreIdentificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreIdentificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreIdentificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
