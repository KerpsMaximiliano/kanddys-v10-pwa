import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformTextareaQuestionComponent } from './webform-textarea-question.component';

describe('WebformTextareaQuestionComponent', () => {
  let component: WebformTextareaQuestionComponent;
  let fixture: ComponentFixture<WebformTextareaQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformTextareaQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformTextareaQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
