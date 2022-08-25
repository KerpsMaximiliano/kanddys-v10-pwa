import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreShareComponent } from './store-share.component';

describe('StoreShareComponent', () => {
  let component: StoreShareComponent;
  let fixture: ComponentFixture<StoreShareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreShareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreShareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
