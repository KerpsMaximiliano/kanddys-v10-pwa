import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-symbol-editor',
  templateUrl: './symbol-editor.component.html',
  styleUrls: ['./symbol-editor.component.scss']
})
export class SymbolEditorComponent implements OnInit {
  env : string = environment.assetsUrl;
  toggleSwitch : boolean = false;
  constructor() {}

  ngOnInit(): void {
  }

}
