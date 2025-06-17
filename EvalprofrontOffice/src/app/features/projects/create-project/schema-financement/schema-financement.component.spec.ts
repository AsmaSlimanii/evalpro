import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaFinancementComponent } from './schema-financement.component';

describe('SchemaFinancementComponent', () => {
  let component: SchemaFinancementComponent;
  let fixture: ComponentFixture<SchemaFinancementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaFinancementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SchemaFinancementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
