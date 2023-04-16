import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsRedirectionComponent } from './payments-redirection.component';

describe('PaymentsRedirectionComponent', () => {
  let component: PaymentsRedirectionComponent;
  let fixture: ComponentFixture<PaymentsRedirectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentsRedirectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentsRedirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
