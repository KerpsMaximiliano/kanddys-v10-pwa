import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaxEditionComponent } from './tax-edition.component';



describe('ItemCreationComponent', () => {
  let component: TaxEditionComponent;
  let fixture: ComponentFixture<TaxEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxEditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
