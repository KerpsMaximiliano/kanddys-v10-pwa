import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasPrefacturasComponent } from './facturas-prefacturas.component';

describe('FacturasPrefacturasComponent', () => {
  let component: FacturasPrefacturasComponent;
  let fixture: ComponentFixture<FacturasPrefacturasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacturasPrefacturasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturasPrefacturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
