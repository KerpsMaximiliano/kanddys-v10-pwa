import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderStoreComponent } from './provider-store.component';

describe('ProviderStoreComponent', () => {
  let component: ProviderStoreComponent;
  let fixture: ComponentFixture<ProviderStoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderStoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
