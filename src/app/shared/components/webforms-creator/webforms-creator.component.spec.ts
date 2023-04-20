import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebformsCreatorComponent } from './webforms-creator.component';

describe('WebformsCreatorComponent', () => {
  let component: WebformsCreatorComponent;
  let fixture: ComponentFixture<WebformsCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebformsCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebformsCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
