import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsCarousellComponent } from './tags-carousell.component';

describe('TagsCarousellComponent', () => {
  let component: TagsCarousellComponent;
  let fixture: ComponentFixture<TagsCarousellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagsCarousellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsCarousellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
