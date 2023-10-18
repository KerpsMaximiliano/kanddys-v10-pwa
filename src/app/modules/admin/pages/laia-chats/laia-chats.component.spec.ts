import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaiaChatsComponent } from './laia-chats.component';

describe('LaiaChatsComponent', () => {
  let component: LaiaChatsComponent;
  let fixture: ComponentFixture<LaiaChatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaiaChatsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaiaChatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
