import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowCompletionComponent } from './flow-completion.component';

describe('FlowCompletionComponent', () => {
  let component: FlowCompletionComponent;
  let fixture: ComponentFixture<FlowCompletionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowCompletionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
