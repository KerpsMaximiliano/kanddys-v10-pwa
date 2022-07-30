import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagCategoryCreatorComponent } from './item-category-creator.component';

describe('TagCategoryCreatorComponent', () => {
  let component: TagCategoryCreatorComponent;
  let fixture: ComponentFixture<TagCategoryCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagCategoryCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagCategoryCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
