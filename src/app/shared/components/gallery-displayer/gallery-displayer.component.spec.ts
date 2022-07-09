import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryDisplayerComponent } from './gallery-displayer.component';

describe('GalleryDisplayerComponent', () => {
  let component: GalleryDisplayerComponent;
  let fixture: ComponentFixture<GalleryDisplayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleryDisplayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryDisplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
