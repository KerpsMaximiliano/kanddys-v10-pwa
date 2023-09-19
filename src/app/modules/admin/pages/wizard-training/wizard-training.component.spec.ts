import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardTrainingComponent } from './wizard-training.component';

describe('WizardTrainingComponent', () => {
  let component: WizardTrainingComponent;
  let fixture: ComponentFixture<WizardTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WizardTrainingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
