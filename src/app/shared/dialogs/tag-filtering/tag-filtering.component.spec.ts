import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagFilteringComponent } from './tag-filtering.component';

describe('TagFilteringComponent', () => {
  let component: TagFilteringComponent;
  let fixture: ComponentFixture<TagFilteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagFilteringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagFilteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
