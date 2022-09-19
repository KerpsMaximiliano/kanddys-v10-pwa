import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-create-dynamic-item',
  templateUrl: './create-dynamic-item.component.html',
  styleUrls: ['./create-dynamic-item.component.scss'],
})
export class CreateDynamicItemComponent implements OnInit {
  itemForm = new FormGroup({
    params: new FormArray([]),
  });

  constructor() {}

  ngOnInit(): void {}

  generateFields() {
    const paramValueFormGroupInput: {
      name: FormControl;
      description: FormControl;
      quantity: FormControl;
      image: FormControl;
      price?: FormControl;
    } = {
      name: new FormControl(),
      description: new FormControl(),
      quantity: new FormControl(),
      image: new FormControl(),
    };
  }
}
