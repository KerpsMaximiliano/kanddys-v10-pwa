import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryPreviewComponent } from './delivery-preview.component';

describe('DeliveryPreviewComponent', () => {
  let component: DeliveryPreviewComponent;
  let fixture: ComponentFixture<DeliveryPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
