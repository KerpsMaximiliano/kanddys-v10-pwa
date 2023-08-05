import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStarsComponent } from './user-stars.component';

describe('UserStarsComponent', () => {
  let component: UserStarsComponent;
  let fixture: ComponentFixture<UserStarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserStarsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserStarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
