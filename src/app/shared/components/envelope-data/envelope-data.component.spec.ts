import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvelopeDataComponent } from './envelope-data.component';

describe('EnvelopeDataComponent', () => {
  let component: EnvelopeDataComponent;
  let fixture: ComponentFixture<EnvelopeDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnvelopeDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvelopeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
