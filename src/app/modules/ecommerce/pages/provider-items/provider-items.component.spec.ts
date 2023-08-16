import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderItemsComponent } from './provider-items.component';

describe('ProviderItemsComponent', () => {
  let component: ProviderItemsComponent;
  let fixture: ComponentFixture<ProviderItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
