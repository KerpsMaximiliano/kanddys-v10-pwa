import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputTransparentComponent } from './input-transparent.component';

describe('InputTransparentComponent', () => {
  let component: InputTransparentComponent;
  let fixture: ComponentFixture<InputTransparentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputTransparentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputTransparentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
