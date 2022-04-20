import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizerListComponent } from './customizer-list.component';

describe('CustomizerListComponent', () => {
  let component: CustomizerListComponent;
  let fixture: ComponentFixture<CustomizerListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomizerListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
