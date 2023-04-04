import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlePrivacyComponent } from './article-privacy.component';

describe('ArticlePrivacyComponent', () => {
  let component: ArticlePrivacyComponent;
  let fixture: ComponentFixture<ArticlePrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticlePrivacyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticlePrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
