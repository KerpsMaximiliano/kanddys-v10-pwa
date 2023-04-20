import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformOptionsSelectorComponent } from './webform-options-selector.component';

describe('WebformOptionsSelectorComponent', () => {
  let component: WebformOptionsSelectorComponent;
  let fixture: ComponentFixture<WebformOptionsSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformOptionsSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformOptionsSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
