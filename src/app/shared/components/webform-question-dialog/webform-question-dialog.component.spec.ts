import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformQuestionDialogComponent } from './webform-question-dialog.component';

describe('WebformQuestionDialogComponent', () => {
  let component: WebformQuestionDialogComponent;
  let fixture: ComponentFixture<WebformQuestionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformQuestionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformQuestionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
