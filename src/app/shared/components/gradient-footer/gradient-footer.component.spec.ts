import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GradientFooterComponent } from './gradient-footer.component';

describe('GradientFooterComponent', () => {
  let component: GradientFooterComponent;
  let fixture: ComponentFixture<GradientFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GradientFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GradientFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
