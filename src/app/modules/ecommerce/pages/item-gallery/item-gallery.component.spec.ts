import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemGalleryComponent } from './item-gallery.component';

describe('ItemGalleryComponent', () => {
  let component: ItemGalleryComponent;
  let fixture: ComponentFixture<ItemGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
