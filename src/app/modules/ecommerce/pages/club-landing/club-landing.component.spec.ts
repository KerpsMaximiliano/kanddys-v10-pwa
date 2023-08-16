import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubLandingComponent } from './club-landing.component';

describe('ClubLandingComponent', () => {
  let component: ClubLandingComponent;
  let fixture: ComponentFixture<ClubLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClubLandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
