import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleflowItemComponent } from './saleflow-item.component';

describe('SaleflowItemComponent', () => {
  let component: SaleflowItemComponent;
  let fixture: ComponentFixture<SaleflowItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleflowItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleflowItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
