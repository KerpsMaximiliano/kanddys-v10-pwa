import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectionsComponent } from './redirections.component';

describe('RedirectionsComponent', () => {
  let component: RedirectionsComponent;
  let fixture: ComponentFixture<RedirectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedirectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
