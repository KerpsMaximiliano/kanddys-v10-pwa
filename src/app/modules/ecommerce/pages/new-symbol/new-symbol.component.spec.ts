import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSymbolComponent } from './new-symbol.component';

describe('NewSymbolComponent', () => {
  let component: NewSymbolComponent;
  let fixture: ComponentFixture<NewSymbolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewSymbolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSymbolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
