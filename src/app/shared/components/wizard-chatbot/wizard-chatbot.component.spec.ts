import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardChatbotComponent } from './wizard-chatbot.component';

describe('StoreChatbotComponent', () => {
  let component: WizardChatbotComponent;
  let fixture: ComponentFixture<WizardChatbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WizardChatbotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardChatbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
