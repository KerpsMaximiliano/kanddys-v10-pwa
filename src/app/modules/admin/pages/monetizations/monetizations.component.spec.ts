import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonetizationsComponent } from './monetizations.component';

describe('MonetizationsComponent', () => {
  let component: MonetizationsComponent;
  let fixture: ComponentFixture<MonetizationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonetizationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonetizationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
