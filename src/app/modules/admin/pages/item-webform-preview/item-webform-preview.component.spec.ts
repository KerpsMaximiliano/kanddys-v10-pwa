import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemWebformPreviewComponent } from './item-webform-preview.component';

describe('ItemWebformPreviewComponent', () => {
  let component: ItemWebformPreviewComponent;
  let fixture: ComponentFixture<ItemWebformPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemWebformPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemWebformPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
