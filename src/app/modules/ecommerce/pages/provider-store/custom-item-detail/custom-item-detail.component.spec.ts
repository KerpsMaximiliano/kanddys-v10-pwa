import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomItemDetailComponent } from './custom-item-detail.component';

describe('CustomItemDetailComponent', () => {
  let component: CustomItemDetailComponent;
  let fixture: ComponentFixture<CustomItemDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomItemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
