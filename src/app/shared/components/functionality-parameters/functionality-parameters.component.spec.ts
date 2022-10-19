import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionalityParametersComponent } from './functionality-parameters.component';

describe('FunctionalityParametersComponent', () => {
  let component: FunctionalityParametersComponent;
  let fixture: ComponentFixture<FunctionalityParametersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionalityParametersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionalityParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
