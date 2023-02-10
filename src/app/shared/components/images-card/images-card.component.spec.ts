import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesCardComponent } from './images-card.component';

describe('ImagesCardComponent', () => {
  let component: ImagesCardComponent;
  let fixture: ComponentFixture<ImagesCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImagesCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
