import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewItemDisplayComponent } from './new-item-display.component';

describe('NewItemDisplayComponent', () => {
  let component: NewItemDisplayComponent;
  let fixture: ComponentFixture<NewItemDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewItemDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewItemDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
