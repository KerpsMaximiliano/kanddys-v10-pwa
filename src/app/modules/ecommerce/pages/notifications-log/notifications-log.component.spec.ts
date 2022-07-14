import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsLogComponent } from './notifications-log.component';

describe('NotificationsLogComponent', () => {
  let component: NotificationsLogComponent;
  let fixture: ComponentFixture<NotificationsLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationsLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
