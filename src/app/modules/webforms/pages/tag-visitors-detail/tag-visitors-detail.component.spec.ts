import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagVisitorsDetailComponent } from './tag-visitors-detail.component';

describe('TagVisitorsDetailComponent', () => {
  let component: TagVisitorsDetailComponent;
  let fixture: ComponentFixture<TagVisitorsDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagVisitorsDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagVisitorsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
