import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QrEditComponent } from './qr-edit.component';

describe('QrEditComponent', () => {
  let component: QrEditComponent;
  let fixture: ComponentFixture<QrEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
