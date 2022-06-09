import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MallGiftsComponent } from './mall-gifts.component';

describe('MallGiftsComponent', () => {
  let component: MallGiftsComponent;
  let fixture: ComponentFixture<MallGiftsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MallGiftsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MallGiftsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
