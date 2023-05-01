import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KioskerosCardsComponent } from './kioskeros-cards.component';

describe('KioskerosCardsComponent', () => {
  let component: KioskerosCardsComponent;
  let fixture: ComponentFixture<KioskerosCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KioskerosCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KioskerosCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
