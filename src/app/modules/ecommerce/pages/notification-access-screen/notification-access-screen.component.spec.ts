import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationAccessScreenComponent } from './notification-access-screen.component';

describe('NotificationAccessScreenComponent', () => {
  let component: NotificationAccessScreenComponent;
  let fixture: ComponentFixture<NotificationAccessScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationAccessScreenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationAccessScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
