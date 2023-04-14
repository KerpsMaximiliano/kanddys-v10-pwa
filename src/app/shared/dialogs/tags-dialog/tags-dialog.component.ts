import {
  Component,
  OnInit,
  Input,
  ComponentFactoryResolver,
} from '@angular/core';
import { WebformAnswerLayoutOption } from 'src/app/core/types/answer-selector';
import { Router } from '@angular/router';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-tags-dialog',
  templateUrl: './tags-dialog.component.html',
  styleUrls: ['./tags-dialog.component.scss'],
})
export class TagsDialogComponent implements OnInit {
  @Input() title = 'Tipo de Tag';
  @Input() subtitle = 'Que tipo de grupo necesitas?';

  @Input() cardTitle: string = 'AAAAAA';

  @Input() webformOptions: WebformAnswerLayoutOption[];

  @Input() tags = ['De Artículos', 'De Facturas'];

  entity: string;

  constructor(private router: Router, private _DialogRef: DialogRef) {}

  ngOnInit(): void {}
  selectedOption(e: number) {
    console.log(e);
    const redirectTo = 'admin/tags';
    if (e === 0) {
      this.entity = 'item';
    } else if (e === 1) {
      this.entity = 'order';
    }
    this.router.navigate(['admin', 'create-tag'], {
      queryParams: {
        entity: this.entity,
        redirectTo,
      },
    });
    this._DialogRef.close();
  }

  close() {
    this._DialogRef.close();
  }
}
