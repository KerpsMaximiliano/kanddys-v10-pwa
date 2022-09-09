import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformInputSelectorComponent } from './webform-input-selector.component';

describe('WebformInputSelectorComponent', () => {
  let component: WebformInputSelectorComponent;
  let fixture: ComponentFixture<WebformInputSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformInputSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformInputSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
