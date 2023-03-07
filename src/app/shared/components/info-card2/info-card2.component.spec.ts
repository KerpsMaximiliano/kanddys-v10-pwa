import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoCard2Component } from './info-card2.component';

describe('InfoCard2Component', () => {
  let component: InfoCard2Component;
  let fixture: ComponentFixture<InfoCard2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoCard2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoCard2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
