import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantDashboardv2Component } from './merchant-dashboardv2.component';

describe('MerchantDashboardv2Component', () => {
  let component: MerchantDashboardv2Component;
  let fixture: ComponentFixture<MerchantDashboardv2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantDashboardv2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantDashboardv2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
