import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostsMetricsComponent } from './costs-metrics.component';

describe('CostsMetricsComponent', () => {
  let component: CostsMetricsComponent;
  let fixture: ComponentFixture<CostsMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostsMetricsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostsMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
