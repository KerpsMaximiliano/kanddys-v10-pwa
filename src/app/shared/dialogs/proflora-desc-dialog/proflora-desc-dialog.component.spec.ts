import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfloraDescDialogComponent } from './proflora-desc-dialog.component';

describe('ProfloraDescDialogComponent', () => {
  let component: ProfloraDescDialogComponent;
  let fixture: ComponentFixture<ProfloraDescDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfloraDescDialogComponent]
    });
    fixture = TestBed.createComponent(ProfloraDescDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
