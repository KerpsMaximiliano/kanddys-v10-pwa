import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosedQuestionCardComponent } from './closed-question-card.component';

describe('ClosedQuestionCardComponent', () => {
  let component: ClosedQuestionCardComponent;
  let fixture: ComponentFixture<ClosedQuestionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClosedQuestionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosedQuestionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
