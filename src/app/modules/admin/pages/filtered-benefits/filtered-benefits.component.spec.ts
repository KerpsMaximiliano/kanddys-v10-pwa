import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredBenefitsComponent } from './filtered-benefits.component';

describe('FilteredBenefitsComponent', () => {
  let component: FilteredBenefitsComponent;
  let fixture: ComponentFixture<FilteredBenefitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilteredBenefitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilteredBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
