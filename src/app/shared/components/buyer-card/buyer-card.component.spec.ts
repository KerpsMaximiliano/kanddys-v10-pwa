import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerCardComponent } from './buyer-card.component';

describe('BuyerCardComponent', () => {
  let component: BuyerCardComponent;
  let fixture: ComponentFixture<BuyerCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuyerCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
