import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItemOrder } from 'src/app/core/models/order';
import { Reservation } from 'src/app/core/models/reservation';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
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
  orders: ItemOrder[];
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  mode: 'calendar' | 'order';

  constructor(
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private merchantsService: MerchantsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.status = 'loading';
      // const user = await this.authService.me();
      // if (!user) return;
      const merchant = await this.merchantsService.merchantDefault();
      if (!merchant) return;
      if (params.id) {
        this.mode = 'calendar';
        this.reservations =
          await this.reservationService.getReservationByCalendar({
            // options: {
            //   limit: 10
            // },
            findBy: {
              calendar: params.id,
            },
          });
      } else {
        this.mode = 'order';
        this.reservations =
          await this.reservationService.getReservationByMerchant(merchant._id);
        if (!this.reservations?.length) return;
        const orders = (
          await this.merchantsService.ordersByMerchant(merchant._id, {
            options: {
              limit: 50,
            },
          })
        )?.ordersByMerchant;
        if (!orders?.length) return;
        this.orders = orders.filter((order) =>
          order.items.some((item) => item.reservation?._id)
        );
      }
      this.status = 'complete';
    });
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
