import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Reservation } from 'src/app/core/models/reservation';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { environment } from 'src/environments/environment';

const reservations = [
  {
    headline: { text: 'Date ID' },
    subheadline: [{ text: 'Calendario Name ID' }],
    rightSubHeadline: { text: 'right-subheadline' },
    icon: [
      {
        src: '/person.svg',
        width: 15,
        height: 19,
      },
    ],
  },
];

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss'],
})
export class ReservationsComponent implements OnInit {
  tabs: string[] = ['ÚLTIMAS', 'FUTURAS', 'PASADAS'];
  active: number = 0;
  editMode: boolean;
  env: string = environment.assetsUrl;
  reservations: Reservation[];

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      this.reservations = await this.reservationService.getReservationByCalendar(params.id);
      console.log(this.reservations);
    })
  }

  placeholder = () => {
    console.log('Funcion Placeholder');
  };

  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  changeTab(index: number) {
    this.active = index;
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging() {
    this.mouseDown = false;
  }

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  toggleEdit = () => {
    this.editMode = !this.editMode;
  };

  deleteOrder() {
    console.log('Borra esta orden');
  }
}
