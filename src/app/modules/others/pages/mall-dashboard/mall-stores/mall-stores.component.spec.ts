import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MallStoresComponent } from './mall-stores.component';

describe('MallStoresComponent', () => {
  let component: MallStoresComponent;
  let fixture: ComponentFixture<MallStoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MallStoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MallStoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
