import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreVisualizerComponent } from './pre-visualizer.component';

describe('PreVisualizerComponent', () => {
  let component: PreVisualizerComponent;
  let fixture: ComponentFixture<PreVisualizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreVisualizerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
