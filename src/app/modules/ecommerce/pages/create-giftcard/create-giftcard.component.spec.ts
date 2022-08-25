import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGiftcardComponent } from './create-giftcard.component';

describe('CreateGiftcardComponent', () => {
  let component: CreateGiftcardComponent;
  let fixture: ComponentFixture<CreateGiftcardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGiftcardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGiftcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
