import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsOffersComponent } from './items-offers.component';

describe('ItemsOffersComponent', () => {
  let component: ItemsOffersComponent;
  let fixture: ComponentFixture<ItemsOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemsOffersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
