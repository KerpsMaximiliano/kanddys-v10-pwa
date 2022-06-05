import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewItemContactInfoComponent } from './new-item-contact-info.component';

describe('NewItemContactInfoComponent', () => {
  let component: NewItemContactInfoComponent;
  let fixture: ComponentFixture<NewItemContactInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewItemContactInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewItemContactInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
