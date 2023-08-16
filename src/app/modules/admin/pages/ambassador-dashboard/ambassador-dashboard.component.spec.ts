import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbassadorDashboardComponent } from './ambassador-dashboard.component';

describe('AmbassadorDashboardComponent', () => {
  let component: AmbassadorDashboardComponent;
  let fixture: ComponentFixture<AmbassadorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmbassadorDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmbassadorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
