import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationCreatorComponent } from './notification-creator.component';

describe('NotificationCreatorComponent', () => {
  let component: NotificationCreatorComponent;
  let fixture: ComponentFixture<NotificationCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
