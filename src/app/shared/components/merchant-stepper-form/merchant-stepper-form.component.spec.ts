import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantStepperFormComponent } from './merchant-stepper-form.component';

describe('MerchantStepperFormComponent', () => {
  let component: MerchantStepperFormComponent;
  let fixture: ComponentFixture<MerchantStepperFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantStepperFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantStepperFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
