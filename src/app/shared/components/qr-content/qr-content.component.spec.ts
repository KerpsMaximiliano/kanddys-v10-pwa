import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QrContentComponent } from './qr-content.component';

describe('QrContentComponent', () => {
  let component: QrContentComponent;
  let fixture: ComponentFixture<QrContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QrContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
