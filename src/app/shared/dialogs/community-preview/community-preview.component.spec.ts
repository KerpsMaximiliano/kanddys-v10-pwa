import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPreviewComponent } from './community-preview.component';

describe('CommunityPreviewComponent', () => {
  let component: CommunityPreviewComponent;
  let fixture: ComponentFixture<CommunityPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommunityPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
