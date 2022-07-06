import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AirtableFieldConnectionComponent } from './airtable-field-connection.component';

describe('AirtableFieldConnectionComponent', () => {
  let component: AirtableFieldConnectionComponent;
  let fixture: ComponentFixture<AirtableFieldConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AirtableFieldConnectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AirtableFieldConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
