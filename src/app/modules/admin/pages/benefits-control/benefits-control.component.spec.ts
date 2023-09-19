import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefitsControlComponent } from './benefits-control.component';

describe('BenefitsControlComponent', () => {
  let component: BenefitsControlComponent;
  let fixture: ComponentFixture<BenefitsControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BenefitsControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BenefitsControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
