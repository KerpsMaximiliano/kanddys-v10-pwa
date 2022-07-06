import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDashboardOptionsComponent } from './item-dashboard-options.component';

describe('ItemDashboardOptionsComponent', () => {
  let component: ItemDashboardOptionsComponent;
  let fixture: ComponentFixture<ItemDashboardOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemDashboardOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDashboardOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
