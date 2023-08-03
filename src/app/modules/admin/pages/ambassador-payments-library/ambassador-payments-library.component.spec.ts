import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbassadorPaymentsLibraryComponent } from './ambassador-payments-library.component';

describe('AmbassadorPaymentsLibraryComponent', () => {
  let component: AmbassadorPaymentsLibraryComponent;
  let fixture: ComponentFixture<AmbassadorPaymentsLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmbassadorPaymentsLibraryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmbassadorPaymentsLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
