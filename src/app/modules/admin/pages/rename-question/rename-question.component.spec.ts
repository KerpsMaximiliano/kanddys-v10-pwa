import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameQuestionComponent } from './rename-question.component';

describe('RenameQuestionComponent', () => {
  let component: RenameQuestionComponent;
  let fixture: ComponentFixture<RenameQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenameQuestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
