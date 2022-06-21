import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserContactLandingComponent } from './user-contact-landing.component';

describe('UserContactLandingComponent', () => {
  let component: UserContactLandingComponent;
  let fixture: ComponentFixture<UserContactLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserContactLandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserContactLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
