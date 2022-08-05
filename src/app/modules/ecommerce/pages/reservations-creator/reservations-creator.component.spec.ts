import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationsCreatorComponent } from './reservations-creator.component';

describe('ReservationsCreatorComponent', () => {
  let component: ReservationsCreatorComponent;
  let fixture: ComponentFixture<ReservationsCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReservationsCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationsCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
