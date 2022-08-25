import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadwordListComponent } from './leadword-list.component';

describe('LeadwordListComponent', () => {
  let component: LeadwordListComponent;
  let fixture: ComponentFixture<LeadwordListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadwordListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadwordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
