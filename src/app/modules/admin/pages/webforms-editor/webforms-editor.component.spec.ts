import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformsEditorComponent } from './webforms-editor.component';

describe('WebformsEditorComponent', () => {
  let component: WebformsEditorComponent;
  let fixture: ComponentFixture<WebformsEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformsEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
