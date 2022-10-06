import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelperHeaderv3Component } from './helper-headerv3.component';

describe('HelperHeaderv3Component', () => {
  let component: HelperHeaderv3Component;
  let fixture: ComponentFixture<HelperHeaderv3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelperHeaderv3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelperHeaderv3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
