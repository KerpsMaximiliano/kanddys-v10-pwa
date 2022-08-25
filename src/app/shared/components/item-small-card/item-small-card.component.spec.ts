import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSmallCardComponent } from './item-small-card.component';

describe('ItemSmallCardComponent', () => {
  let component: ItemSmallCardComponent;
  let fixture: ComponentFixture<ItemSmallCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSmallCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSmallCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
