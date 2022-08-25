import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderElementListComponent } from './slider-element-list.component';

describe('SliderElementListComponent', () => {
  let component: SliderElementListComponent;
  let fixture: ComponentFixture<SliderElementListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderElementListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderElementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
