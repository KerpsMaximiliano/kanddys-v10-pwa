import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantLandingComponent } from './merchant-landing.component';

describe('MerchantLandingComponent', () => {
  let component: MerchantLandingComponent;
  let fixture: ComponentFixture<MerchantLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantLandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
