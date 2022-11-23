import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleParamsComponent } from './article-params.component';

describe('ArticleParamsComponent', () => {
  let component: ArticleParamsComponent;
  let fixture: ComponentFixture<ArticleParamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArticleParamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArticleParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
