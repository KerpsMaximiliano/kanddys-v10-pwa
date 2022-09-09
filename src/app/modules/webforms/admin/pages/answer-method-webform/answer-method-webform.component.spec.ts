import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerMethodWebformComponent } from './answer-method-webform.component';

describe('AnswerMethodWebformComponent', () => {
  let component: AnswerMethodWebformComponent;
  let fixture: ComponentFixture<AnswerMethodWebformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnswerMethodWebformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerMethodWebformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
