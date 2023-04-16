import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformMetricsComponent } from './webform-metrics.component';

describe('WebformMetricsComponent', () => {
  let component: WebformMetricsComponent;
  let fixture: ComponentFixture<WebformMetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformMetricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
