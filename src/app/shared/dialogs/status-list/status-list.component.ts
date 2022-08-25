import { Component, OnInit, Input } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-status-list',
  templateUrl: './status-list.component.html',
  styleUrls: ['./status-list.component.scss']
})
export class StatusListComponent implements OnInit {
  @Input() statusList: {
    status: 
      | 'cancelled'
      | 'started'
      | 'verifying'
      | 'in progress'
      | 'to confirm'
      | 'completed'
      | 'error'
      | 'draft';
    name: 
      | 'cancelado' 
      | 'empezado' 
      | 'verificando' 
      | 'verificado' 
      | 'en revisión' 
      | 'por confirmar' 
      | 'completado' 
      | 'error';
  }[];

  constructor(
    private ref: DialogRef,
  ) { }

  ngOnInit(): void {
  }

  close() {
    this.ref.close();
  }

}
