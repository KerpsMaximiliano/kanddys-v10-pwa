import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactLandingContainerComponent } from './contact-landing-container.component';

describe('ContactLandingContainerComponent', () => {
  let component: ContactLandingContainerComponent;
  let fixture: ComponentFixture<ContactLandingContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactLandingContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactLandingContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
