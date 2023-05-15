import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormResponsesByQuestionComponent } from './form-responses-by-question.component';

describe('FormResponsesByQuestionComponent', () => {
  let component: FormResponsesByQuestionComponent;
  let fixture: ComponentFixture<FormResponsesByQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormResponsesByQuestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormResponsesByQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
