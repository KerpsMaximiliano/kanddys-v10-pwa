import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Authentication } from './authentication.component';

describe('Authentication', () => {
  let component: Authentication;
  let fixture: ComponentFixture<Authentication>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Authentication ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Authentication);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
