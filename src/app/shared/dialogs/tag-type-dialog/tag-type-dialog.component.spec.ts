import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagTypeDialogComponent } from './tag-type-dialog.component';

describe('TagTypeDialogComponent', () => {
  let component: TagTypeDialogComponent;
  let fixture: ComponentFixture<TagTypeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagTypeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
