import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-input-transparent',
  templateUrl: './input-transparent.component.html',
  styleUrls: ['./input-transparent.component.scss'],
})
export class InputTransparentComponent implements OnInit {
  @Input() title: string = 'Simbolo' ;
  @Input() inputLabel: string = 'Clave de acceso:';
  @Output() fieldValue = new EventEmitter<any>();
  input = new FormControl('', [Validators.required, Validators.minLength(3)]);

  constructor( private ref: DialogRef ) {}

  close(){
   this.ref.close();
  }

  fieldEvent(value){
   this.fieldValue.emit(value);
  }

  ngOnInit(): void {}
}
