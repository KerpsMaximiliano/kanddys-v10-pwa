import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformWebhookConfigComponent } from './webform-webhook-config.component';

describe('WebformWebhookConfigComponent', () => {
  let component: WebformWebhookConfigComponent;
  let fixture: ComponentFixture<WebformWebhookConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformWebhookConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformWebhookConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
