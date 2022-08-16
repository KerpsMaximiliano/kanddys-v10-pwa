import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeavenlyBalloonsComponent } from './heavenly-balloons.component';

describe('HeavenlyBalloonsComponent', () => {
  let component: HeavenlyBalloonsComponent;
  let fixture: ComponentFixture<HeavenlyBalloonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeavenlyBalloonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeavenlyBalloonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
