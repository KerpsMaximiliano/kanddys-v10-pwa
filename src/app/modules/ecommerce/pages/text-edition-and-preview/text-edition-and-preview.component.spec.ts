import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditionAndPreviewComponent } from './text-edition-and-preview.component';

describe('TextEditionAndPreviewComponent', () => {
  let component: TextEditionAndPreviewComponent;
  let fixture: ComponentFixture<TextEditionAndPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextEditionAndPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextEditionAndPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
