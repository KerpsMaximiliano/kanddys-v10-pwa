import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-merchants-entry',
  templateUrl: './merchants-entry.component.html',
  styleUrls: ['./merchants-entry.component.scss']
})
export class MerchantsEntryComponent implements OnInit {

  merchantForm: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.merchantForm = this.formBuilder.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submitForm() {
    if (this.merchantForm.invalid) {
      return;
    }

    // Obtener los valores del formulario
    const storeName = this.merchantForm.value.name;
    const phone = this.merchantForm.value.phone;
    const password = this.merchantForm.value.password;

    // Realizar acciones con los valores del formulario
    // Por ejemplo, enviar una solicitud HTTP al servidor para crear una nueva tienda

    // Reiniciar el formulario
    // this.merchantForm.reset();
  }

}
