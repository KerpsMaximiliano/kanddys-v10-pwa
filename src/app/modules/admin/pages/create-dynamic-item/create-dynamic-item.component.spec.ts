import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDynamicItemComponent } from './create-dynamic-item.component';

describe('CreateDynamicItemComponent', () => {
  let component: CreateDynamicItemComponent;
  let fixture: ComponentFixture<CreateDynamicItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDynamicItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDynamicItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
