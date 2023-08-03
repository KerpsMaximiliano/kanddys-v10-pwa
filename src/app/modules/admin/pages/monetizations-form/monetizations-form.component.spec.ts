import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonetizationsFormComponent } from './monetizations-form.component';

describe('MonetizationsFormComponent', () => {
  let component: MonetizationsFormComponent;
  let fixture: ComponentFixture<MonetizationsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonetizationsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonetizationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
