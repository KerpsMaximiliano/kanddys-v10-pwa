import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagAsignationComponent } from './tag-asignation.component';

describe('TagAsignationComponent', () => {
  let component: TagAsignationComponent;
  let fixture: ComponentFixture<TagAsignationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagAsignationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagAsignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
