import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseTagComponent } from './close-tag.component';

describe('CloseTagComponent', () => {
  let component: CloseTagComponent;
  let fixture: ComponentFixture<CloseTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
