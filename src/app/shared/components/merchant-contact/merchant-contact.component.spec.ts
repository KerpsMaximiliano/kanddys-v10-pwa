import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantContactComponent } from './merchant-contact.component';

describe('MerchantContactComponent', () => {
  let component: MerchantContactComponent;
  let fixture: ComponentFixture<MerchantContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
