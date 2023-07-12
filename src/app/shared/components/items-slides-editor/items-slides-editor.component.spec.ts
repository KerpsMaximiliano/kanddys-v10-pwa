import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsSlidesEditorComponent } from './items-slides-editor.component';

describe('ItemsSlidesEditorComponent', () => {
  let component: ItemsSlidesEditorComponent;
  let fixture: ComponentFixture<ItemsSlidesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemsSlidesEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsSlidesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
