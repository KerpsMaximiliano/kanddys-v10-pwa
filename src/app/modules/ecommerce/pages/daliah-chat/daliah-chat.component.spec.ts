import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaliahChatComponent } from './daliah-chat.component';

describe('DaliahChatComponent', () => {
  let component: DaliahChatComponent;
  let fixture: ComponentFixture<DaliahChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaliahChatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaliahChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
