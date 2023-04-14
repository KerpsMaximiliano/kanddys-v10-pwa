import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroKioskoComponent } from './registro-kiosko.component';

describe('RegistroKioskoComponent', () => {
  let component: RegistroKioskoComponent;
  let fixture: ComponentFixture<RegistroKioskoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroKioskoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroKioskoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
