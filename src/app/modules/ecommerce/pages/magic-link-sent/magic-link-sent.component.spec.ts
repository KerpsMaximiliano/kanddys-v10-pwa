import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagicLinkSentComponent } from './magic-link-sent.component';

describe('MagicLinkSentComponent', () => {
  let component: MagicLinkSentComponent;
  let fixture: ComponentFixture<MagicLinkSentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MagicLinkSentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MagicLinkSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
