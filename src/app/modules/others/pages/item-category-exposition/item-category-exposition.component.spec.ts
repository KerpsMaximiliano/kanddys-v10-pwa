import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCategoryExpositionComponent } from './item-category-exposition.component';

describe('ItemCategoryExpositionComponent', () => {
  let component: ItemCategoryExpositionComponent;
  let fixture: ComponentFixture<ItemCategoryExpositionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemCategoryExpositionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemCategoryExpositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
