import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostAuthComponent } from './post-auth.component';

describe('PostAuthComponent', () => {
  let component: PostAuthComponent;
  let fixture: ComponentFixture<PostAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostAuthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
