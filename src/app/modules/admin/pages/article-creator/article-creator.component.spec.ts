import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleCreatorComponent } from './article-creator.component';

describe('ArticleCreatorComponent', () => {
  let component: ArticleCreatorComponent;
  let fixture: ComponentFixture<ArticleCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
