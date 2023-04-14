import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullMenuButtonComponent } from './full-menu-button.component';

describe('FullMenuButtonComponent', () => {
  let component: FullMenuButtonComponent;
  let fixture: ComponentFixture<FullMenuButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullMenuButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullMenuButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
