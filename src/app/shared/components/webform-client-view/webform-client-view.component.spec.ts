import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformClientViewComponent } from './webform-client-view.component';

describe('WebformClientViewComponent', () => {
  let component: WebformClientViewComponent;
  let fixture: ComponentFixture<WebformClientViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebformClientViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformClientViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
