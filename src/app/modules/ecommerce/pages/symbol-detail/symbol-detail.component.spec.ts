import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolDetailComponent } from './symbol-detail.component';

describe('SymbolDetailComponent', () => {
  let component: SymbolDetailComponent;
  let fixture: ComponentFixture<SymbolDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SymbolDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SymbolDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
