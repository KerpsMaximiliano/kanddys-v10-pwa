import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformMultipleSelectionQuestionComponent } from './webform-multiple-selection-question.component';

describe('WebformMultipleSelectionQuestionComponent', () => {
  let component: WebformMultipleSelectionQuestionComponent;
  let fixture: ComponentFixture<WebformMultipleSelectionQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformMultipleSelectionQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformMultipleSelectionQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
