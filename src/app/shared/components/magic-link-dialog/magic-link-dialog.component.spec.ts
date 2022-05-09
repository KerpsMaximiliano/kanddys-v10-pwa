import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MagicLinkDialogComponent } from './magic-link-dialog.component';

describe('MagicLinkDialogComponent', () => {
  let component: MagicLinkDialogComponent;
  let fixture: ComponentFixture<MagicLinkDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MagicLinkDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MagicLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
