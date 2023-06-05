import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionToAdminComponent } from './question-to-admin.component';

describe('QuestionToAdminComponent', () => {
  let component: QuestionToAdminComponent;
  let fixture: ComponentFixture<QuestionToAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionToAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionToAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
