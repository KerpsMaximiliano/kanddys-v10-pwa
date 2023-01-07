import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';

enum FormType {
  text = 'text',
  checkbox = 'checkbox',
  area = 'area',
  selection = 'selection',
}

@Component({
  selector: 'app-general-dialog',
  templateUrl: './general-dialog.component.html',
  styleUrls: ['./general-dialog.component.scss'],
})
export class GeneralDialogComponent implements OnInit, OnDestroy {
  @Input('containerStyles') containerStyles: Record<string, string>;
  @Input('dialogId') dialogId: string;
  @Input('header') header: {
    styles?: Record<string, string>;
    text?: string;
  } = {};
  @Input('title') title: {
    styles?: Record<string, string>;
    text?: string;
  } = {};
  @Input('fields') fields: {
    styles?: Record<string, string>;
    list?: Array<{
      type: FormType;
      stylesGrid: Record<string, string>;
      placeholder: string;
      styles: Record<string, string>;
      name: string;
      label: {
        styles: Record<string, string>;
        text: string;
      };
      disclaimer: {
        styles: Record<string, string>;
        text: string;
      };
      selection: {
        selection: {
          ['prop']: string;
        };
        styles: Record<string, string>;
        list: Array<{
          text: string;
          barStyle: Record<string, string>;
          subText: {
            text: string;
            text2?: string;
            styles: Record<string, string>;
          };
          styles: Record<string, string>;
        }>;
      };
      prop: string;
      value: any;
      validators: ValidatorFn[];
    }>;
  } = {};
  @Input('isMultiple') isMultiple: boolean = false;
  @Output('data') data: EventEmitter<any> = new EventEmitter();
  @Input('omitTabFocus') omitTabFocus: boolean = true;
  selected: string[] = [];
  controller: FormGroup;
  sub: Subscription;

  constructor(private dialogFlowService: DialogFlowService) {}

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
      this.data.emit({
        value,
        fields: this.fields.list,
        valid: this.controller.valid,
      });
    });
  }

  checkboxChange({ target }, control: AbstractControl): void {
    control.setValue(target.checked);
  }
}
