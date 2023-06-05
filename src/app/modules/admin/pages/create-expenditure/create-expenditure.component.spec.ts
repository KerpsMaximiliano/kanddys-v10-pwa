import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExpenditureComponent } from './create-expenditure.component';

describe('CreateExpenditureComponent', () => {
  let component: CreateExpenditureComponent;
  let fixture: ComponentFixture<CreateExpenditureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateExpenditureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateExpenditureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
