import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitesNotificationsComponent } from './invites-notifications.component';

describe('InvitesNotificationsComponent', () => {
  let component: InvitesNotificationsComponent;
  let fixture: ComponentFixture<InvitesNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitesNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitesNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
