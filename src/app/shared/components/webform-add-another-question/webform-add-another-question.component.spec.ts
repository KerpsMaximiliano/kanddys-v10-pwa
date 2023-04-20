import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformAddAnotherQuestionComponent } from './webform-add-another-question.component';

describe('WebformAddAnotherQuestionComponent', () => {
  let component: WebformAddAnotherQuestionComponent;
  let fixture: ComponentFixture<WebformAddAnotherQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformAddAnotherQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformAddAnotherQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
