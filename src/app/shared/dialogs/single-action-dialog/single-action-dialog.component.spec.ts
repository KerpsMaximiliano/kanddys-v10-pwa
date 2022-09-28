import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleActionDialogComponent } from './single-action-dialog.component';

describe('SingleActionDialogComponent', () => {
  let component: SingleActionDialogComponent;
  let fixture: ComponentFixture<SingleActionDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleActionDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
