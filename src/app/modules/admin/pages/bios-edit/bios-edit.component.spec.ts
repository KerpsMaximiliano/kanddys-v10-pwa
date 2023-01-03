import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BiosEditComponent } from './bios-edit.component';

describe('BiosEditComponent', () => {
  let component: BiosEditComponent;
  let fixture: ComponentFixture<BiosEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BiosEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BiosEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
