import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralItemComponent } from './general-item.component';

describe('GeneralItemComponent', () => {
  let component: GeneralItemComponent;
  let fixture: ComponentFixture<GeneralItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
