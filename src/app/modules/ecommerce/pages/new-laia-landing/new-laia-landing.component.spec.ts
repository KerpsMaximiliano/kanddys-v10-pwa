import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewLaiaLandingComponent } from './new-laia-landing.component';

describe('NewLaiaLandingComponent', () => {
  let component: NewLaiaLandingComponent;
  let fixture: ComponentFixture<NewLaiaLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewLaiaLandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewLaiaLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
