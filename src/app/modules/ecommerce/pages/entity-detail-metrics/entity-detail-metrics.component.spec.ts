import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDetailMetricsComponent } from './entity-detail-metrics.component';

describe('EntityDetailMetricsComponent', () => {
  let component: EntityDetailMetricsComponent;
  let fixture: ComponentFixture<EntityDetailMetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityDetailMetricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityDetailMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
