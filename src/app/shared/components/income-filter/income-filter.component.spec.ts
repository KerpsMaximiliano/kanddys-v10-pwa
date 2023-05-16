import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeFilterComponent } from './income-filter.component';

describe('IncomeFilterComponent', () => {
  let component: IncomeFilterComponent;
  let fixture: ComponentFixture<IncomeFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
