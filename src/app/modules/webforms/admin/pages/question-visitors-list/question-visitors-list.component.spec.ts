import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionVisitorsListComponent } from './question-visitors-list.component';

describe('QuestionVisitorsListComponent', () => {
  let component: QuestionVisitorsListComponent;
  let fixture: ComponentFixture<QuestionVisitorsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionVisitorsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionVisitorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
