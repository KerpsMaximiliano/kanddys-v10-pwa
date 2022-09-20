import { async, ComponentFixture, TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:src/app/modules/admin/pages/actions-menu/actions-menu.component.spec.ts
import { ActionsMenuComponent } from './actions-menu.component';

describe('ActionsMenuComponent', () => {
  let component: ActionsMenuComponent;
  let fixture: ComponentFixture<ActionsMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionsMenuComponent ]
========
import { StoreComponent } from './store.component';

describe('StoreComponent', () => {
  let component: StoreComponent;
  let fixture: ComponentFixture<StoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreComponent ]
>>>>>>>> staging:src/app/modules/ecommerce/pages/store/store.component.spec.ts
    })
    .compileComponents();
  }));

  beforeEach(() => {
<<<<<<<< HEAD:src/app/modules/admin/pages/actions-menu/actions-menu.component.spec.ts
    fixture = TestBed.createComponent(ActionsMenuComponent);
========
    fixture = TestBed.createComponent(StoreComponent);
>>>>>>>> staging:src/app/modules/ecommerce/pages/store/store.component.spec.ts
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
