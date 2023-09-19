import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfloraCampainComponent } from './proflora-campain.component';

describe('ProfloraCampainComponent', () => {
  let component: ProfloraCampainComponent;
  let fixture: ComponentFixture<ProfloraCampainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfloraCampainComponent]
    });
    fixture = TestBed.createComponent(ProfloraCampainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
