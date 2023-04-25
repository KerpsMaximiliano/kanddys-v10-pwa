import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsGridComponent } from './options-grid.component';

describe('OptionsGridComponent', () => {
  let component: OptionsGridComponent;
  let fixture: ComponentFixture<OptionsGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionsGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
