import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCategoryCreatorComponent } from './item-category-creator.component';

describe('ItemCategoryCreatorComponent', () => {
  let component: ItemCategoryCreatorComponent;
  let fixture: ComponentFixture<ItemCategoryCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemCategoryCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemCategoryCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
