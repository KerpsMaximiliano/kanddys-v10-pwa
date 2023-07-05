import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsSlidesEditorComponent } from './posts-slides-editor.component';

describe('PostsSlidesEditorComponent', () => {
  let component: PostsSlidesEditorComponent;
  let fixture: ComponentFixture<PostsSlidesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostsSlidesEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsSlidesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
