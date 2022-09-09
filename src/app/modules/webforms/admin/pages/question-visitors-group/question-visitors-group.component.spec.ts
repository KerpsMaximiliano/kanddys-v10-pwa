import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionVisitorsGroupComponent } from './question-visitors-group.component';

describe('QuestionVisitorsGroupComponent', () => {
  let component: QuestionVisitorsGroupComponent;
  let fixture: ComponentFixture<QuestionVisitorsGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionVisitorsGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionVisitorsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
