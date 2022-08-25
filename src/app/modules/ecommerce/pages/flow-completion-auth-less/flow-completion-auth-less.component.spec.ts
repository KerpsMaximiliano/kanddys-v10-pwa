import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowCompletionAuthLessComponent } from './flow-completion-auth-less.component';

describe('FlowCompletionAuthLessComponent', () => {
  let component: FlowCompletionAuthLessComponent;
  let fixture: ComponentFixture<FlowCompletionAuthLessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlowCompletionAuthLessComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowCompletionAuthLessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
