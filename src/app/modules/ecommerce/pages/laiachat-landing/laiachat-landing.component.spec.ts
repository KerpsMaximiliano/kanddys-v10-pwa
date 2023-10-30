import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaiachatLandingComponent } from './laiachat-landing.component';

describe('LaiachatLandingComponent', () => {
  let component: LaiachatLandingComponent;
  let fixture: ComponentFixture<LaiachatLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaiachatLandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaiachatLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
