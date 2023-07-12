import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryCreatorComponent } from './inventory-creator.component';

describe('InventoryCreatorComponent', () => {
  let component: InventoryCreatorComponent;
  let fixture: ComponentFixture<InventoryCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
