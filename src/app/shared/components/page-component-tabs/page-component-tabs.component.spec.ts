import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageComponentTabsComponent } from './page-component-tabs.component';

describe('PageComponentTabsComponent', () => {
  let component: PageComponentTabsComponent;
  let fixture: ComponentFixture<PageComponentTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageComponentTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageComponentTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
