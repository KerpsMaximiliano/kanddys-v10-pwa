import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaUploadDndComponentComponent } from './media-upload-dnd-component.component';

describe('MediaUploadDndComponentComponent', () => {
  let component: MediaUploadDndComponentComponent;
  let fixture: ComponentFixture<MediaUploadDndComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MediaUploadDndComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaUploadDndComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
