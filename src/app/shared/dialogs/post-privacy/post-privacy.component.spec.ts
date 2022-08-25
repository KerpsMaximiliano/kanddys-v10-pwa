import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostPrivacyComponent } from './post-privacy.component';

describe('PostPrivacyComponent', () => {
  let component: PostPrivacyComponent;
  let fixture: ComponentFixture<PostPrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostPrivacyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostPrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
