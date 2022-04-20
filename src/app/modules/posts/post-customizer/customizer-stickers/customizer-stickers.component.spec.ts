import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizerStickersComponent } from './customizer-stickers.component';

describe('CustomizerStickersComponent', () => {
  let component: CustomizerStickersComponent;
  let fixture: ComponentFixture<CustomizerStickersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomizerStickersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizerStickersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
