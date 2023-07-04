import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarsLandingComponent } from './stars-landing.component';

describe('StarsLandingComponent', () => {
  let component: StarsLandingComponent;
  let fixture: ComponentFixture<StarsLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarsLandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StarsLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
