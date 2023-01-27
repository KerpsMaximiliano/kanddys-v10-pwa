import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BiosBannerComponent } from './bios-banner.component';

describe('BiosBannerComponent', () => {
  let component: BiosBannerComponent;
  let fixture: ComponentFixture<BiosBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BiosBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BiosBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
