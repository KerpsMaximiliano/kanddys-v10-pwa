import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityItemListComponent } from './entity-item-list.component';

describe('EntityItemListComponent', () => {
  let component: EntityItemListComponent;
  let fixture: ComponentFixture<EntityItemListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityItemListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
