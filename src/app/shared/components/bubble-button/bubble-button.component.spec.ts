import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BubbleButtonComponent } from './bubble-button.component';

describe('BubbleButtonComponent', () => {
  let component: BubbleButtonComponent;
  let fixture: ComponentFixture<BubbleButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BubbleButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BubbleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
