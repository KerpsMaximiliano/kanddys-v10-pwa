import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformsClientComponent } from './webforms-client.component';

describe('WebformsClientComponent', () => {
  let component: WebformsClientComponent;
  let fixture: ComponentFixture<WebformsClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformsClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformsClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
