import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderItemsManagementComponent } from './provider-items-management.component';

describe('ProviderItemsManagementComponent', () => {
  let component: ProviderItemsManagementComponent;
  let fixture: ComponentFixture<ProviderItemsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderItemsManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderItemsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
