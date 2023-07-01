import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreChatbotComponent } from './store-chatbot.component';

describe('StoreChatbotComponent', () => {
  let component: StoreChatbotComponent;
  let fixture: ComponentFixture<StoreChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StoreChatbotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
