import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OneLineItemComponent } from './one-line-item.component';

describe('OneLineItemComponent', () => {
  let component: OneLineItemComponent;
  let fixture: ComponentFixture<OneLineItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OneLineItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneLineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
