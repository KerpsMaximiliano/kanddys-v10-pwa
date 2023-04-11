import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NamedExpenseComponent } from './named-expense.component';

describe('NamedExpenseComponent', () => {
  let component: NamedExpenseComponent;
  let fixture: ComponentFixture<NamedExpenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NamedExpenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NamedExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
