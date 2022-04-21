import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizerRedirectComponent } from './customizer-redirect.component';

describe('CustomizerRedirectComponent', () => {
  let component: CustomizerRedirectComponent;
  let fixture: ComponentFixture<CustomizerRedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomizerRedirectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizerRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
