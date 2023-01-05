import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleAccessComponent } from './article-access.component';

describe('ArticleAccessComponent', () => {
  let component: ArticleAccessComponent;
  let fixture: ComponentFixture<ArticleAccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleAccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
