import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationSimpleComponent } from './confirmation-simple.component';

describe('ConfirmationSimpleComponent', () => {
  let component: ConfirmationSimpleComponent;
  let fixture: ComponentFixture<ConfirmationSimpleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmationSimpleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationSimpleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
