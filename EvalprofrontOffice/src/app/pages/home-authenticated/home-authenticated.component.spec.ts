import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeAuthenticatedComponent } from './home-authenticated.component';

describe('HomeAuthenticatedComponent', () => {
  let component: HomeAuthenticatedComponent;
  let fixture: ComponentFixture<HomeAuthenticatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeAuthenticatedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeAuthenticatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
