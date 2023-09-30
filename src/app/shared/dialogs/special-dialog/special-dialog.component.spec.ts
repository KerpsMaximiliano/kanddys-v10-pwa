import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialDialogComponent } from './special-dialog.component';

describe('SpecialDialogComponent', () => {
  let component: SpecialDialogComponent;
  let fixture: ComponentFixture<SpecialDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpecialDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
