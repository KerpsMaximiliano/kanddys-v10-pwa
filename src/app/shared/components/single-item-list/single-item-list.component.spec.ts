import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleItemListComponent } from './single-item-list.component';

describe('SingleItemListComponent', () => {
  let component: SingleItemListComponent;
  let fixture: ComponentFixture<SingleItemListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleItemListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
