import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesOptionComponent } from './activities-option.component';

describe('ActivitiesOptionComponent', () => {
  let component: ActivitiesOptionComponent;
  let fixture: ComponentFixture<ActivitiesOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitiesOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
