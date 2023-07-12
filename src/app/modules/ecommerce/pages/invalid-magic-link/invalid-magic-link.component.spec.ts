import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvalidMagicLinkComponent } from './invalid-magic-link.component';

describe('InvalidMagicLinkComponent', () => {
  let component: InvalidMagicLinkComponent;
  let fixture: ComponentFixture<InvalidMagicLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvalidMagicLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvalidMagicLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
