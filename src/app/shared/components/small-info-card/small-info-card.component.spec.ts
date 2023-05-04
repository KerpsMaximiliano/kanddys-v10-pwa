import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallInfoCardComponent } from './small-info-card.component';

describe('SmallInfoCardComponent', () => {
  let component: SmallInfoCardComponent;
  let fixture: ComponentFixture<SmallInfoCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmallInfoCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
