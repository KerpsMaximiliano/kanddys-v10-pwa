import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiverFormComponent } from './receiver-form.component';

describe('ReceiverFormComponent', () => {
  let component: ReceiverFormComponent;
  let fixture: ComponentFixture<ReceiverFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiverFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiverFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
