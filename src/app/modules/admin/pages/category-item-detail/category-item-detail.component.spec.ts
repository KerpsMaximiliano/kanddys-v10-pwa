import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryItemDetailComponent } from './category-item-detail.component';

describe('CategoryItemDetailComponent', () => {
  let component: CategoryItemDetailComponent;
  let fixture: ComponentFixture<CategoryItemDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryItemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
