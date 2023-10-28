import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialsEditorComponent } from './socials-editor.component';

describe('SocialsEditorComponent', () => {
  let component: SocialsEditorComponent;
  let fixture: ComponentFixture<SocialsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocialsEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
