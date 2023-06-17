import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressSliderComponent } from './progress-slider.component';

describe('ProgressSliderComponent', () => {
  let component: ProgressSliderComponent;
  let fixture: ComponentFixture<ProgressSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
