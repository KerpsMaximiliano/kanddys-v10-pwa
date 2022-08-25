import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelperHeaderComponent } from './helper-header.component';

describe('HelperHeaderComponent', () => {
  let component: HelperHeaderComponent;
  let fixture: ComponentFixture<HelperHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelperHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelperHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
