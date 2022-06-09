import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditButtonsComponent } from './post-edit-buttons.component';

describe('PostEditButtonsComponent', () => {
  let component: PostEditButtonsComponent;
  let fixture: ComponentFixture<PostEditButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostEditButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostEditButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
