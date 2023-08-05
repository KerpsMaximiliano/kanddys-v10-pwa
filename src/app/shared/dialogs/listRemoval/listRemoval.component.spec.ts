import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRemoval } from './listRemoval.component';

describe('ListRemoval', () => {
  let component: ListRemoval;
  let fixture: ComponentFixture<ListRemoval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListRemoval ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListRemoval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
