import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsReservationComponent } from './metrics-reservation.component';

describe('MetricsReservationComponent', () => {
  let component: MetricsReservationComponent;
  let fixture: ComponentFixture<MetricsReservationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricsReservationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricsReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
