import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsInfoComponent } from './metrics-info.component';

describe('MetricsInfoComponent', () => {
  let component: MetricsInfoComponent;
  let fixture: ComponentFixture<MetricsInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricsInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
