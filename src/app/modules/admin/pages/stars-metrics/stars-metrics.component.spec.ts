import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarsMetricsComponent } from './stars-metrics.component';

describe('StarsMetricsComponent', () => {
  let component: StarsMetricsComponent;
  let fixture: ComponentFixture<StarsMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StarsMetricsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StarsMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
