import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagItemsComponent } from './tag-items.component';

describe('TagItemsComponent', () => {
  let component: TagItemsComponent;
  let fixture: ComponentFixture<TagItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
