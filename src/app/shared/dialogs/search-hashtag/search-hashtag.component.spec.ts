import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchHashtagComponent } from './search-hashtag.component';

describe('SearchHashtagComponent', () => {
  let component: SearchHashtagComponent;
  let fixture: ComponentFixture<SearchHashtagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchHashtagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchHashtagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
