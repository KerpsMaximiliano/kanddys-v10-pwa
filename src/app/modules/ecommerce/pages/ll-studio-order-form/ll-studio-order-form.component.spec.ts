import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LlStudioOrderFormComponent } from './ll-studio-order-form.component';

describe('LlStudioOrderFormComponent', () => {
  let component: LlStudioOrderFormComponent;
  let fixture: ComponentFixture<LlStudioOrderFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LlStudioOrderFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LlStudioOrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
