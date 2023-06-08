import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsSearchComponent } from './clients-search.component';

describe('ClientsSearchComponent', () => {
  let component: ClientsSearchComponent;
  let fixture: ComponentFixture<ClientsSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientsSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
