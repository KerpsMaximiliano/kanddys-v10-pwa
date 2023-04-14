import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkRegisterComponent } from './link-register.component';

describe('LinkRegisterComponent', () => {
  let component: LinkRegisterComponent;
  let fixture: ComponentFixture<LinkRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
