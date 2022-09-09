import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformAnswersComponent } from './webform-answers.component';

describe('WebformAnswersComponent', () => {
  let component: WebformAnswersComponent;
  let fixture: ComponentFixture<WebformAnswersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformAnswersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
