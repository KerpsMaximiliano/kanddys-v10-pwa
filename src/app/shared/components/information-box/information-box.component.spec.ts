import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationBoxComponent } from './information-box.component';

describe('InformationBoxComponent', () => {
  let component: InformationBoxComponent;
  let fixture: ComponentFixture<InformationBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformationBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformationBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
