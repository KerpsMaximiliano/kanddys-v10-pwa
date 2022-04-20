import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningStepsComponent } from './warning-steps.component';

describe('WarningStepsComponent', () => {
  let component: WarningStepsComponent;
  let fixture: ComponentFixture<WarningStepsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarningStepsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarningStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
