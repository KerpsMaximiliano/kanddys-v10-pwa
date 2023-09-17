import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostsMetricsNavigationComponent } from './costs-metrics-navigation.component';

describe('CostsMetricsNavigationComponent', () => {
  let component: CostsMetricsNavigationComponent;
  let fixture: ComponentFixture<CostsMetricsNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostsMetricsNavigationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostsMetricsNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
