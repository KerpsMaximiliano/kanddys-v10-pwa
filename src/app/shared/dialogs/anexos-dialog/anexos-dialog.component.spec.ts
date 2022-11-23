import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnexosDialogComponent } from './anexos-dialog.component';

describe('AnexosDialogComponent', () => {
  let component: AnexosDialogComponent;
  let fixture: ComponentFixture<AnexosDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnexosDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnexosDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
