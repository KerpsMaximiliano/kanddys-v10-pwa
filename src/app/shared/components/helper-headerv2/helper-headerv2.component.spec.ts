import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelperHeaderv2Component } from './helper-headerv2.component';

describe('HelperHeaderv2Component', () => {
  let component: HelperHeaderv2Component;
  let fixture: ComponentFixture<HelperHeaderv2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelperHeaderv2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelperHeaderv2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
