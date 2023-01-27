import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss'],
})
export class QrComponent implements OnInit {
  constructor(private _ActivatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    const qrId = this._ActivatedRoute.snapshot.paramMap.get('qrId');
    console.log(qrId);
  }
}
