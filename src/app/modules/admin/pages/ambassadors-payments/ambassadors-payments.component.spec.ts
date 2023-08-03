import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbassadorsPaymentsComponent } from './ambassadors-payments.component';

describe('AmbassadorsPaymentsComponent', () => {
  let component: AmbassadorsPaymentsComponent;
  let fixture: ComponentFixture<AmbassadorsPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmbassadorsPaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmbassadorsPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
