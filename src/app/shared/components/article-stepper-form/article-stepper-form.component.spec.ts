import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleStepperFormComponent } from './article-stepper-form.component';

describe('ArticleStepperFormComponent', () => {
  let component: ArticleStepperFormComponent;
  let fixture: ComponentFixture<ArticleStepperFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleStepperFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleStepperFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
