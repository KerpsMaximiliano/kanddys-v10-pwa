import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemReservationComponent } from './item-reservation.component';

describe('ItemReservationComponent', () => {
  let component: ItemReservationComponent;
  let fixture: ComponentFixture<ItemReservationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemReservationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
