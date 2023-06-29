import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateButtonLinkComponent } from './create-button-link.component';

describe('CreateButtonLinkComponent', () => {
  let component: CreateButtonLinkComponent;
  let fixture: ComponentFixture<CreateButtonLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateButtonLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateButtonLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
