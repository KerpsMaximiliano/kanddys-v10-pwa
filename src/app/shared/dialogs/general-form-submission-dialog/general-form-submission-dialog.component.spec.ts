import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralFormSubmissionDialogComponent } from './general-form-submission-dialog.component';

describe('GeneralFormSubmissionDialogComponent', () => {
  let component: GeneralFormSubmissionDialogComponent;
  let fixture: ComponentFixture<GeneralFormSubmissionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralFormSubmissionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralFormSubmissionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
