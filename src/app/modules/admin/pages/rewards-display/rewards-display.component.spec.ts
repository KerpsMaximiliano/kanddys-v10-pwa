import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardsDisplayComponent } from './rewards-display.component';

describe('RewardsDisplayComponent', () => {
  let component: RewardsDisplayComponent;
  let fixture: ComponentFixture<RewardsDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RewardsDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RewardsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
