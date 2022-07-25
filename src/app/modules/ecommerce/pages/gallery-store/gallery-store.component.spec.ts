import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryStoreComponent } from './gallery-store.component';

describe('GalleryStoreComponent', () => {
  let component: GalleryStoreComponent;
  let fixture: ComponentFixture<GalleryStoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleryStoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GalleryStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
