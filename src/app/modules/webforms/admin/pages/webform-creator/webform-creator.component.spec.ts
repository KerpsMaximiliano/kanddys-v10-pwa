import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformCreatorComponent } from './webform-creator.component';

describe('WebformCreatorComponent', () => {
  let component: WebformCreatorComponent;
  let fixture: ComponentFixture<WebformCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
