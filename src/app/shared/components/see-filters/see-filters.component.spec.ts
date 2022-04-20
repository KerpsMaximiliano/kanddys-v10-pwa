import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeFiltersComponent } from './see-filters.component';

describe('SeeFiltersComponent', () => {
  let component: SeeFiltersComponent;
  let fixture: ComponentFixture<SeeFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeeFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeeFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
