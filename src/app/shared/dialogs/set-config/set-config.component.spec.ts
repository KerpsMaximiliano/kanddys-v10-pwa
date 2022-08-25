import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetConfigComponent } from './set-config.component';

describe('SetConfigComponent', () => {
  let component: SetConfigComponent;
  let fixture: ComponentFixture<SetConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
