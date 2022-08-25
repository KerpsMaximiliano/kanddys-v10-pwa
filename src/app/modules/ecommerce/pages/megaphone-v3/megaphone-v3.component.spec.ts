import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MegaphoneV3Component } from './megaphone-v3.component';

describe('MegaphoneV3Component', () => {
  let component: MegaphoneV3Component;
  let fixture: ComponentFixture<MegaphoneV3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MegaphoneV3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MegaphoneV3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
