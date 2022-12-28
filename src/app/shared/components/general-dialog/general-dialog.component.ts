import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-general-dialog',
  templateUrl: './general-dialog.component.html',
  styleUrls: ['./general-dialog.component.scss'],
})
export class GeneralDialogComponent implements OnInit, OnDestroy {
  @Input('containerStyles') containerStyles: any;
  @Input('header') header: any = {};
  @Input('fields') fields: any = {};
  @Input('isMultiple') isMultiple: boolean = false;
  @Output('data') data: EventEmitter<any> = new EventEmitter();
  selected: string[] = [];
  controller: FormGroup;
  sub: Subscription;

  constructor() {}

  ngOnInit(): void {
    this.initControllers();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  setSelected(item, controller: AbstractControl): void {
    if (this.selected.includes(item)) {
      this.selected = this.selected.filter((tg) => tg !== item);
      controller.setValue(this.selected);
    } else {
      const value = this.isMultiple ? [...this.selected, item] : [item];
      this.selected = value;
      controller.setValue(this.selected);
    }
  }

  initControllers(): void {
    this.controller = new FormGroup({});
    for (const { name, value, validators } of this.fields.list) {
      this.controller.addControl(name, new FormControl(value, validators));
    }
    this.sub = this.controller.valueChanges.subscribe((value) => {
      if (this.controller.valid) {
        console.log('value: ', value);
        this.data.emit(value);
      }
    });
  }

  checkboxChange({ target }, control: AbstractControl): void {
    control.setValue(target.checked);
  }
}
