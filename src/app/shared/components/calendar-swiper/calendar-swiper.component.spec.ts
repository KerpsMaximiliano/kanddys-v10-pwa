import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarSwiperComponent } from './calendar-swiper.component';

describe('CalendarSwiperComponent', () => {
  let component: CalendarSwiperComponent;
  let fixture: ComponentFixture<CalendarSwiperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarSwiperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarSwiperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
