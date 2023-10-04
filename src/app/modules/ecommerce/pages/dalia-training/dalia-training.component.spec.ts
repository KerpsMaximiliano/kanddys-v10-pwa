import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DaliaTrainingComponent } from './dalia-training.component';

describe('DaliaTrainingComponent', () => {
  let component: DaliaTrainingComponent;
  let fixture: ComponentFixture<DaliaTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaliaTrainingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaliaTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
