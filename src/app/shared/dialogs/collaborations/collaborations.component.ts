import { Component, OnInit } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-collaborations',
  templateUrl: './collaborations.component.html',
  styleUrls: ['./collaborations.component.scss']
})
export class CollaborationsComponent implements OnInit {
  env: string = environment.assetsUrl;

  constructor(private ref: DialogRef) {}

  ngOnInit(): void {
  }

  close() {
    this.ref.close();
  }
}
