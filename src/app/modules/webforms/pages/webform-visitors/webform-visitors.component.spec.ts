import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformVisitorsComponent } from './webform-visitors.component';

describe('WebformVisitorsComponent', () => {
  let component: WebformVisitorsComponent;
  let fixture: ComponentFixture<WebformVisitorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformVisitorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformVisitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
