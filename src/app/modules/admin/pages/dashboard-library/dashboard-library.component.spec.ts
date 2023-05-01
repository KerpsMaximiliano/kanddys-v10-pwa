import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLibraryComponent } from './dashboard-library.component';

describe('DashboardLibraryComponent', () => {
  let component: DashboardLibraryComponent;
  let fixture: ComponentFixture<DashboardLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
