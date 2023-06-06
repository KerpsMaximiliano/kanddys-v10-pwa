import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemAdminCardComponent } from './item-admin-card.component';

describe('ItemAdminCardComponent', () => {
  let component: ItemAdminCardComponent;
  let fixture: ComponentFixture<ItemAdminCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemAdminCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemAdminCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
