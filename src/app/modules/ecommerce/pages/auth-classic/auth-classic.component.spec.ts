import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthClassicComponent } from './auth-classic.component';

describe('AuthClassicComponent', () => {
  let component: AuthClassicComponent;
  let fixture: ComponentFixture<AuthClassicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthClassicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthClassicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
