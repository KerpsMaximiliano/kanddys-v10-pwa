import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AffiliateReferalsComponent } from './affiliate-referrals.component';

describe('AdminCartsComponent', () => {
  let component: AffiliateReferalsComponent;
  let fixture: ComponentFixture<AffiliateReferalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateReferalsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateReferalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
