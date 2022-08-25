import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreejsCanvasComponent } from './threejs-canvas.component';

describe('ThreejsCanvasComponent', () => {
  let component: ThreejsCanvasComponent;
  let fixture: ComponentFixture<ThreejsCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreejsCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreejsCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
