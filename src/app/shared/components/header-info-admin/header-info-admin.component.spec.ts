import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderInfoAdminComponent } from './header-info-admin.component';

describe('HeaderInfoAdminComponent', () => {
  let component: HeaderInfoAdminComponent;
  let fixture: ComponentFixture<HeaderInfoAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderInfoAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderInfoAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
