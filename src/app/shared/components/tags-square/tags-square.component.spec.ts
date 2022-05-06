import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsSquareComponent } from './tags-square.component';

describe('TagsSquareComponent', () => {
  let component: TagsSquareComponent;
  let fixture: ComponentFixture<TagsSquareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagsSquareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsSquareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
