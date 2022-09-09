import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformsAdminComponent } from './webforms-admin.component';

describe('WebformsAdminComponent', () => {
  let component: WebformsAdminComponent;
  let fixture: ComponentFixture<WebformsAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformsAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
