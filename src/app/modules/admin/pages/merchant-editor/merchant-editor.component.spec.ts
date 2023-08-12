import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantEditorComponent } from './merchant-editor.component';

describe('MerchantEditorComponent', () => {
  let component: MerchantEditorComponent;
  let fixture: ComponentFixture<MerchantEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MerchantEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
