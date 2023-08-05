import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAdminDashboardComponent } from './new-admin-dashboard.component';

describe('NewAdminDashboardComponent', () => {
  let component: NewAdminDashboardComponent;
  let fixture: ComponentFixture<NewAdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewAdminDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
