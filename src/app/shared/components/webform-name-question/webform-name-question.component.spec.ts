import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformNameQuestionComponent } from './webform-name-question.component';

describe('WebformNameQuestionComponent', () => {
  let component: WebformNameQuestionComponent;
  let fixture: ComponentFixture<WebformNameQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformNameQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformNameQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
