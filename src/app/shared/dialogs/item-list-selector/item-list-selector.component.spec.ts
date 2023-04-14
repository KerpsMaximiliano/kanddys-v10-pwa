import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemListSelectorComponent } from './item-list-selector.component';

describe('ItemListSelectorComponent', () => {
  let component: ItemListSelectorComponent;
  let fixture: ComponentFixture<ItemListSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemListSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemListSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
