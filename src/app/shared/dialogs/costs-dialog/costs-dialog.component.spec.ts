import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostsDialogComponent } from './costs-dialog.component';

describe('CostsDialogComponent', () => {
  let component: CostsDialogComponent;
  let fixture: ComponentFixture<CostsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
