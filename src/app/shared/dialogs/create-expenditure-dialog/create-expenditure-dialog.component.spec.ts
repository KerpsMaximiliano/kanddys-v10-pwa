import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExpenditureDialogComponent } from './create-expenditure-dialog.component';

describe('CreateExpenditureDialogComponent', () => {
  let component: CreateExpenditureDialogComponent;
  let fixture: ComponentFixture<CreateExpenditureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateExpenditureDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateExpenditureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
