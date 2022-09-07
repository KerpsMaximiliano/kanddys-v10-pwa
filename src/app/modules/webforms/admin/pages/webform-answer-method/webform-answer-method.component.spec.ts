import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformAnswerMethodComponent } from './webform-answer-method.component';

describe('WebformAnswerMethodComponent', () => {
  let component: WebformAnswerMethodComponent;
  let fixture: ComponentFixture<WebformAnswerMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformAnswerMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformAnswerMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
