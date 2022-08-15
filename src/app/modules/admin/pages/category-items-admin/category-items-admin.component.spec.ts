import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryItemsAdminComponent } from './category-items-admin.component';

describe('CategoryItemsAdminComponent', () => {
  let component: CategoryItemsAdminComponent;
  let fixture: ComponentFixture<CategoryItemsAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryItemsAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryItemsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
