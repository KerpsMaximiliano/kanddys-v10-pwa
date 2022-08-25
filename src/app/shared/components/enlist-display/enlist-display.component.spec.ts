import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnlistDisplayComponent } from './enlist-display.component';

describe('EnlistDisplayComponent', () => {
  let component: EnlistDisplayComponent;
  let fixture: ComponentFixture<EnlistDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnlistDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnlistDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
