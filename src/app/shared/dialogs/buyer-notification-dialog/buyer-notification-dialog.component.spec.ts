import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerNotificationDialogComponent } from './buyer-notification-dialog.component';

describe('BuyerNotificationDialogComponent', () => {
  let component: BuyerNotificationDialogComponent;
  let fixture: ComponentFixture<BuyerNotificationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyerNotificationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyerNotificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
