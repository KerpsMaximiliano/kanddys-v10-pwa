import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MallDashboardComponent } from './mall-dashboard.component';

describe('MallDashboardComponent', () => {
  let component: MallDashboardComponent;
  let fixture: ComponentFixture<MallDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MallDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MallDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
