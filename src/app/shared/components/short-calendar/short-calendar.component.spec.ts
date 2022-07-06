import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortCalendarComponent } from './short-calendar.component';

describe('ShortCalendarComponent', () => {
  let component: ShortCalendarComponent;
  let fixture: ComponentFixture<ShortCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShortCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
