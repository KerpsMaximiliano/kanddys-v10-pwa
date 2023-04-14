import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterOptionsComponent } from './router-options.component';

describe('RouterOptionsComponent', () => {
  let component: RouterOptionsComponent;
  let fixture: ComponentFixture<RouterOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouterOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouterOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
