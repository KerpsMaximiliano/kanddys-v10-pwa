import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArticleDetailComponent } from './admin-article-detail.component';

describe('AdminArticleDetailComponent', () => {
  let component: AdminArticleDetailComponent;
  let fixture: ComponentFixture<AdminArticleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminArticleDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminArticleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
