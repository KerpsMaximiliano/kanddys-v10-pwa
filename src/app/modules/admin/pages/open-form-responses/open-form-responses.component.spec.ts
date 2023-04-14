import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenFormResponsesComponent } from './open-form-responses.component';

describe('OpenFormResponsesComponent', () => {
  let component: OpenFormResponsesComponent;
  let fixture: ComponentFixture<OpenFormResponsesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenFormResponsesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenFormResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
