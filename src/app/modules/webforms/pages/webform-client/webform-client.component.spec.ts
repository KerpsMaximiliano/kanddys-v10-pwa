import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformClientComponent } from './webform-client.component';

describe('WebformClientComponent', () => {
  let component: WebformClientComponent;
  let fixture: ComponentFixture<WebformClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
