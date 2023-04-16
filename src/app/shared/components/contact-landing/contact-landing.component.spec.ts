import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactLandingComponent } from './contact-landing.component';

describe('ContactLandingComponent', () => {
  let component: ContactLandingComponent;
  let fixture: ComponentFixture<ContactLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactLandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
