import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantSharedComponent } from './merchant-shared.component';

describe('MerchantSharedComponent', () => {
  let component: MerchantSharedComponent;
  let fixture: ComponentFixture<MerchantSharedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantSharedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
