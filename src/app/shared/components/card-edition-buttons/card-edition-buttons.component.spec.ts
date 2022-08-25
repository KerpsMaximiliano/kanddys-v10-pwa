import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEditionButtonsComponent } from './card-edition-buttons.component';

describe('CardEditionButtonsComponent', () => {
  let component: CardEditionButtonsComponent;
  let fixture: ComponentFixture<CardEditionButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardEditionButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardEditionButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
