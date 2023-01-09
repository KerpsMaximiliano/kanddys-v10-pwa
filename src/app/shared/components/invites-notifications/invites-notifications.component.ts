import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-invites-notifications',
  templateUrl: './invites-notifications.component.html',
  styleUrls: ['./invites-notifications.component.scss']
})
export class InvitesNotificationsComponent implements OnInit {
  @Input('title') title = 'Acceso & Notificaciones';
  @Input('text') text = 'Notificación de cuando accesan: (000) 000 - 0000 ó sin Notificación';

  constructor() { }

  ngOnInit(): void {
  }

}
