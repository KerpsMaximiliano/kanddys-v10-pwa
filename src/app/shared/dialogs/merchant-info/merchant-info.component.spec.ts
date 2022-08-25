import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantInfoComponent } from './merchant-info.component';

describe('MerchantInfoComponent', () => {
  let component: MerchantInfoComponent;
  let fixture: ComponentFixture<MerchantInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
