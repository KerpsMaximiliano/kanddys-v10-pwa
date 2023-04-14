import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleIconHeaderComponent } from './title-icon-header.component';

describe('TitleIconHeaderComponent', () => {
  let component: TitleIconHeaderComponent;
  let fixture: ComponentFixture<TitleIconHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TitleIconHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleIconHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
