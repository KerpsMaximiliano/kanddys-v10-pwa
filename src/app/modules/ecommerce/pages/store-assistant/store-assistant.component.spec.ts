import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreAssistantComponent } from './store-assistant.component';

describe('StoreAssistantComponent', () => {
  let component: StoreAssistantComponent;
  let fixture: ComponentFixture<StoreAssistantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreAssistantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
