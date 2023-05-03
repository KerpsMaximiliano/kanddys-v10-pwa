import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerDataComponent } from './buyer-data.component';

describe('BuyerDataComponent', () => {
  let component: BuyerDataComponent;
  let fixture: ComponentFixture<BuyerDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyerDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyerDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
