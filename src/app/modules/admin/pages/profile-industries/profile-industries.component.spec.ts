import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileIndustriesComponent } from './profile-industries.component';

describe('ProfileIndustriesComponent', () => {
  let component: ProfileIndustriesComponent;
  let fixture: ComponentFixture<ProfileIndustriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileIndustriesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileIndustriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
