import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfloraLinkDialogComponent } from './proflora-link-dialog.component';

describe('ProfloraLinkDialogComponent', () => {
  let component: ProfloraLinkDialogComponent;
  let fixture: ComponentFixture<ProfloraLinkDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfloraLinkDialogComponent]
    });
    fixture = TestBed.createComponent(ProfloraLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
