import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextOrImageComponent } from './text-or-image.component';

describe('TextOrImageComponent', () => {
  let component: TextOrImageComponent;
  let fixture: ComponentFixture<TextOrImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextOrImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextOrImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
