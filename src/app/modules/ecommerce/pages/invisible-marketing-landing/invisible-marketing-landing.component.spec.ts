import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvisibleMarketingLandingComponent } from './invisible-marketing-landing.component';

describe('InvisibleMarketingLandingComponent', () => {
  let component: InvisibleMarketingLandingComponent;
  let fixture: ComponentFixture<InvisibleMarketingLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvisibleMarketingLandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvisibleMarketingLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
