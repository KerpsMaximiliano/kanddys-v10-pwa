import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformMultipleSelectionConfirmationComponent } from './webform-multiple-selection-confirmation.component';

describe('WebformMultipleSelectionConfirmationComponent', () => {
  let component: WebformMultipleSelectionConfirmationComponent;
  let fixture: ComponentFixture<WebformMultipleSelectionConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformMultipleSelectionConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformMultipleSelectionConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
