import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProviderItemsEditorComponent } from './provider-items-editor.component';


describe('ProviderItemsEditorComponent', () => {
  let component: ProviderItemsEditorComponent;
  let fixture: ComponentFixture<ProviderItemsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderItemsEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderItemsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
