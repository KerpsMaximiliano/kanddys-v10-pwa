import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantsEntryComponent } from './merchants-entry.component';

describe('MerchantsEntryComponent', () => {
  let component: MerchantsEntryComponent;
  let fixture: ComponentFixture<MerchantsEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MerchantsEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantsEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
