import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KioskoViewComponent } from './kiosko-view.component';

describe('KioskoViewComponent', () => {
  let component: KioskoViewComponent;
  let fixture: ComponentFixture<KioskoViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KioskoViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KioskoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
