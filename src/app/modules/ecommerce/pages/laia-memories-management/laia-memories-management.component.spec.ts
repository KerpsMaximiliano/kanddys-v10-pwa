import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaiaMemoriesManagementComponent } from './laia-memories-management.component';

describe('LaiaMemoriesManagementComponent', () => {
  let component: LaiaMemoriesManagementComponent;
  let fixture: ComponentFixture<LaiaMemoriesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaiaMemoriesManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaiaMemoriesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
