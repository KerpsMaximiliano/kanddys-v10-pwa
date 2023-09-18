import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaxInput } from 'src/app/core/models/taxes';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { TaxesService } from 'src/app/core/services/taxes.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'app-taxes',
  templateUrl: './tax-edition.component.html',
  styleUrls: ['./tax-edition.component.scss'],
})
export class TaxEditionComponent implements OnInit {
  assetsFolder: string = environment.assetsUrl;
  form: FormGroup;
  returnTo: string;
  manualOrderId: string;
  country:string;
  type:string;
  merchantId:string;
  taxId:string;
  parsedDate:string;
  dateFromatted:string;
  
  constructor(
    private formBuilder: FormBuilder,
    private taxesService: TaxesService,
    private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
  ) { 
    this.form = this.formBuilder.group({
      expirationDate: ['', Validators.required],
      prefix: ['', Validators.required],
      nextTax: ['', Validators.required],
      sequence: ['', Validators.required],
      percentage: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.getCountries();
   this.route.params.subscribe((data) => {
    this.taxId = data.itemId;
   	});
   await this.getQueryParams();
  }

  async getQueryParams(){
    this.route.queryParams.subscribe((data)=>{

        data && data.expiration ? this.form.controls["expirationDate"].setValue(this.formatDate(data.expiration)): "";
        data && data.expiration ? this.dateFromatted = data.expiration: "";
        data && data.percentage ? this.form.controls["percentage"].setValue(data.percentage): "";
        data && data.nextTax ? this.form.controls["nextTax"].setValue(data.nextTax): "";
        data && data.type ? this.type = data.type: "";
        data && data.prefix ? this.form.controls["prefix"].setValue(data.prefix): "";
        data && data.merchant ? this.merchantId = data.merchant : "";
        data && data.finalSequence ? this.form.controls["prefix"].setValue(data.sequence): "";
     })
  }

  async getCountries(){
    let countriesData:any = [];
    const countries = await this.taxesService.getDataCountries();
    countriesData = countries;
    this.country = countriesData.find(country => country.value === 'república dominicana')._id;
  }

  async saveAndExit(){
    console.log(this.form.invalid);
    console.log(this.findInvalidControls());
    if(this.form.dirty && this.form.invalid){
      this.goBack();
      }else{
        console.log("entro por aca");
        
        lockUI();
        if (!this.form.invalid) {
          if(this.taxId){
            await this.editTax();
            unlockUI();
            this.router.navigateByUrl('/admin/taxes');
          }else{
            await this.createTax();
            unlockUI();
            this.router.navigateByUrl('/admin/taxes');
          }
        }else{
          this.goBack();
          unlockUI();
        }
      }
    
    
  }

  change_start_date(event){
    const date = moment(event.value).format('DD/MM/YYYY');
    this.dateFromatted = event.value;
    this.form.controls["expirationDate"].setValue(date);
    this.form.controls["expirationDate"].markAsDirty();
  }

  async createTax(){
    const type = "consumer";
    const merchantId = this.merchantId;
    const input: TaxInput = {
      expirationDate: this.dateFromatted,
      prefix: this.form.controls["prefix"].value,
      percentage: Number(this.form.controls["percentage"].value),
      nextTax: Number(this.form.controls["nextTax"].value),
      finalSequence: this.form.controls["sequence"].value,
    }
    await this.taxesService.createTax(type, this.country, merchantId, input).catch(e => {
      unlockUI();
    });
  }

  async editTax(){
    const input: TaxInput = {
      expirationDate: this.dateFromatted,
      prefix: this.form.controls["prefix"].value,
      percentage: Number(this.form.controls["percentage"].value),
      nextTax: Number(this.form.controls["nextTax"].value),
      finalSequence: this.form.controls["sequence"].value,
    }
    await this.taxesService.updateTax(this.taxId, input).catch(e => {
      unlockUI();
    });;
  }

  formatDate(date){
    const formatted = moment(date).format('DD/MM/YYYY');
    return formatted;
  }

  async goBack() {
    let dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Salir`,
        description: `¿Estás seguro que deseas salir sin guardar cambios?`,
      },
      panelClass: 'confirmation-dialog',
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'confirm') {
        console.log("Entró por aca.");
        
        try {
          lockUI();
            this.router.navigate(['/admin/taxes']);
          unlockUI();
        } catch (error) {
          unlockUI();
        }
      }
    });
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.form.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    return invalid;
}
 
}
