import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms'; // Importar FormGroup y FormBuilder

interface Option {
    value: string;
    viewValue: string;
};

@Component({
    selector: 'app-merchant-register',
    templateUrl: './merchant-register.component.html',
    styleUrls: ['./merchant-register.component.scss']
})
export class MerchantRegisterComponent implements OnInit {
    merchantForm: FormGroup; // Crear un FormGroup

    countries: Option[] = [
        { value: 'country-0', viewValue: 'US' },
        { value: 'country-1', viewValue: 'UK' },
        { value: 'country-2', viewValue: 'Italy' },
    ];

    cities: Option[] = [
        { value: 'city-0', viewValue: 'New York' },
        { value: 'city-1', viewValue: 'London' },
        { value: 'city-2', viewValue: 'Paris' },
    ];

    constructor(private fb: FormBuilder) {
        this.merchantForm = this.fb.group({
            name: ['EscritoID'],
            phone: ['EscritoID'],
            country: ['country-0'],
            city: ['city-0'],
            industry: ['SeleccionadoID']
        });
    }

    ngOnInit(): void {}

    saveData() {
        // Aquí puedes implementar la lógica para guardar los datos
        const formData = this.merchantForm.value;
        console.log(formData);
    }
}