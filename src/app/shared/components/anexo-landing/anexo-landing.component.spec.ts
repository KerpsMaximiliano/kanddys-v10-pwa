import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnexoLandingComponent } from './anexo-landing.component';

describe('AnexoLandingComponent', () => {
  let component: AnexoLandingComponent;
  let fixture: ComponentFixture<AnexoLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnexoLandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnexoLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
