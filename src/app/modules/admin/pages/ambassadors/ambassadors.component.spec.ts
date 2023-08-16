import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbassadorStoreComponent } from './ambassador-store.component';

describe('AmbassadorStoreComponent', () => {
  let component: AmbassadorStoreComponent;
  let fixture: ComponentFixture<AmbassadorStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmbassadorStoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmbassadorStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
