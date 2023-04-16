import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompactCardComponent } from './compact-card.component';

describe('CompactCardComponent', () => {
  let component: CompactCardComponent;
  let fixture: ComponentFixture<CompactCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompactCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompactCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
