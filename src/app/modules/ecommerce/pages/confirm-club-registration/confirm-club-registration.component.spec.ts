import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmClubRegistrationComponent } from './confirm-club-registration.component';

describe('ConfirmClubRegistrationComponent', () => {
  let component: ConfirmClubRegistrationComponent;
  let fixture: ComponentFixture<ConfirmClubRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmClubRegistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmClubRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
