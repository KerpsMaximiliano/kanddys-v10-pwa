import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TitledExpenseComponent } from './titled-expense.component';

describe('TitledExpenseComponent', () => {
  let component: TitledExpenseComponent;
  let fixture: ComponentFixture<TitledExpenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TitledExpenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TitledExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
