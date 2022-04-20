import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthCallerComponent } from './auth-caller.component';

describe('AuthCallerComponent', () => {
  let component: AuthCallerComponent;
  let fixture: ComponentFixture<AuthCallerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthCallerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthCallerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
