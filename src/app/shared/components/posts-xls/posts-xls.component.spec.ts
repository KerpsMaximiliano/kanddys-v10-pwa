import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsXlsComponent } from './posts-xls.component';

describe('PostsXlsComponent', () => {
  let component: PostsXlsComponent;
  let fixture: ComponentFixture<PostsXlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostsXlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsXlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
