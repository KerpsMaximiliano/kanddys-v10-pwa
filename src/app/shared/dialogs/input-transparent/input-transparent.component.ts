import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-input-transparent',
  templateUrl: './input-transparent.component.html',
  styleUrls: ['./input-transparent.component.scss'],
})
export class InputTransparentComponent implements OnInit {
  @Input() title: string = 'Simbolo' ;
  @Input() inputLabel: string = 'Clave de acceso:';
  @Input() templateId: string;
  @Output() fieldValue = new EventEmitter<any>();
  input = new FormControl('', [Validators.required, Validators.minLength(3)]);

  constructor(
    private ref: DialogRef,
    private _EntityTemplateService: EntityTemplateService
  ) {}

  close(){
   this.ref.close();
  }

  fieldEvent(value){
   this.fieldValue.emit(value);
  }

  ngOnInit(): void {}

  submit(): void {
    const submit = async () => {
      const result = await this._EntityTemplateService.entityTemplate(this.templateId,this.input.value);
      console.log('result: ', result);
    }
    submit();
  }
}
