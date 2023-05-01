import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Fase1LandingComponent } from './fase1-landing.component';

describe('Fase1LandingComponent', () => {
  let component: Fase1LandingComponent;
  let fixture: ComponentFixture<Fase1LandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Fase1LandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Fase1LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
