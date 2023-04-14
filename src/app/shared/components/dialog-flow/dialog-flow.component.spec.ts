import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFlowComponent } from './dialog-flow.component';

describe('DialogFlowComponent', () => {
  let component: DialogFlowComponent;
  let fixture: ComponentFixture<DialogFlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
