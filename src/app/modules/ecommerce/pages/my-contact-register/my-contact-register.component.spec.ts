import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyContactRegisterComponent } from './my-contact-register.component';

describe('MyContactRegisterComponent', () => {
  let component: MyContactRegisterComponent;
  let fixture: ComponentFixture<MyContactRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyContactRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyContactRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
