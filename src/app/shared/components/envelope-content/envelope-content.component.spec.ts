import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvelopeContentComponent } from './envelope-content.component';

describe('EnvelopeContentComponent', () => {
  let component: EnvelopeContentComponent;
  let fixture: ComponentFixture<EnvelopeContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnvelopeContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnvelopeContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
