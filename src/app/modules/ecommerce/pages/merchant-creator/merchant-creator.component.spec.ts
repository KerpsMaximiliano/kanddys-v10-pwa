import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantCreatorComponent } from './merchant-creator.component';

describe('MerchantCreatorComponent', () => {
  let component: MerchantCreatorComponent;
  let fixture: ComponentFixture<MerchantCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
