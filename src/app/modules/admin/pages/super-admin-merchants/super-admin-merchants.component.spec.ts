import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminMerchantsComponent } from './super-admin-merchants.component';

describe('SuperAdminMerchantsComponent', () => {
  let component: SuperAdminMerchantsComponent;
  let fixture: ComponentFixture<SuperAdminMerchantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuperAdminMerchantsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuperAdminMerchantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
