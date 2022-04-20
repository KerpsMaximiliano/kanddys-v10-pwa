import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFunnelV2Component } from './form-funnel-v2.component';

describe('FormFunnelV2Component', () => {
  let component: FormFunnelV2Component;
  let fixture: ComponentFixture<FormFunnelV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormFunnelV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFunnelV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
