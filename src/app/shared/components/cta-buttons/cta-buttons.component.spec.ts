import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtaButtonsComponent } from './cta-buttons.component';

describe('CtaButtonsComponent', () => {
  let component: CtaButtonsComponent;
  let fixture: ComponentFixture<CtaButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CtaButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtaButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
