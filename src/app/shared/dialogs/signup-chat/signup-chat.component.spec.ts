import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupChatComponent } from './signup-chat.component';

describe('SignupChatComponent', () => {
  let component: SignupChatComponent;
  let fixture: ComponentFixture<SignupChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
