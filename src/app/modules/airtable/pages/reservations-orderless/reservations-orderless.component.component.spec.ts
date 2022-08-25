import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationOrderlessComponent } from './reservations-orderless.component';

describe('ReservationComponent', () => {
  let component: ReservationOrderlessComponent;
  let fixture: ComponentFixture<ReservationOrderlessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationOrderlessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationOrderlessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
