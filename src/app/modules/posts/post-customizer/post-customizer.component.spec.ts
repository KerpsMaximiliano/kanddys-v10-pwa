import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCustomizerComponent } from './post-customizer.component';

describe('PostCustomizerComponent', () => {
  let component: PostCustomizerComponent;
  let fixture: ComponentFixture<PostCustomizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostCustomizerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostCustomizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
