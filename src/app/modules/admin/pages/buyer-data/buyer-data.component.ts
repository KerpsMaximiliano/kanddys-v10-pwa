import { Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { User } from 'src/app/core/models/user';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SwiperOptions } from 'swiper';

interface ExtendedUser extends User {
  income?: number;
  amount?: number;
}

interface BuyersData {
  status: 'idle' | 'loading' | 'complete' | 'error';
  users: ExtendedUser[];
  length: number;
}

@Component({
  selector: 'app-buyer-data',
  templateUrl: './buyer-data.component.html',
  styleUrls: ['./buyer-data.component.scss'],
})
export class BuyerDataComponent implements OnInit {
  @ViewChild('swiper') swiper: SwiperComponent;
  cardSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 2,
  };

  // rangeBuyers: ExtendedUser[] = [];
  // amountBuyers: ExtendedUser[] = [];
  recurrentBuyers: BuyersData = {
    length: 0,
    status: 'idle',
    users: [],
  };
  allBuyers: BuyersData = {
    length: 0,
    status: 'idle',
    users: [],
  };

  constructor(private merchantsService: MerchantsService) {}

  ngOnInit(): void {
    this.recurrentBuyers = {
      ...this.recurrentBuyers,
      status: 'loading',
    };
    this.allBuyers = {
      ...this.allBuyers,
      status: 'loading',
    };

    Promise.all([
      // Usuarios recurrentes
      this.merchantsService.recurringBuyersByMerchant({
        findBy: {
          merchant: this.merchantsService.merchantData._id,
        },
        options: {
          sortBy: 'count:desc',
          limit: -1,
        },
        filter: {
          percentageResult: 0.2,
        },
      }),
      // Usuarios recurrentes
      // Todos los compradores
      this.merchantsService.buyersByMerchant(
        {
          findBy: {
            merchant: this.merchantsService.merchantData._id,
          },
          options: {
            limit: -1,
          },
        },
        true
      ),
      this.merchantsService.buyersByMerchant({
        findBy: {
          merchant: this.merchantsService.merchantData._id,
        },
        options: {
          limit: 10,
        },
      }),
      // Todos los compradores
    ]).then((result) => {
      // Usuarios recurrentes
      this.recurrentBuyers = {
        status: 'complete',
        users: result[0].map((value) => value.user),
        length: result[0].length,
      };
      // Usuarios recurrentes
      // Todos los compradores
      this.allBuyers = {
        ...this.allBuyers,
        status: 'complete',
        length: result[1].length,
        users: result[2],
      };
      // Todos los compradores

      // Un array con todos los usuarios para obtener el income de cada uno
      const allUsers = [
        ...new Set([
          ...this.recurrentBuyers.users.map((value) => value._id),
          ...this.allBuyers.users.map((value) => value._id),
        ]),
      ];

      allUsers.forEach(async (id) => {
        const incomeMerchant = await this.merchantsService.incomeMerchant({
          findBy: {
            user: id,
            merchant: this.merchantsService.merchantData._id,
          },
        });
        const recurrentUserIndex = this.recurrentBuyers.users.findIndex(
          (user) => user._id === id
        );
        if (recurrentUserIndex > -1)
          this.recurrentBuyers.users[recurrentUserIndex].income =
            incomeMerchant;
        const userIndex = this.allBuyers.users.findIndex(
          (user) => user._id === id
        );
        if (userIndex > -1)
          this.allBuyers.users[userIndex].income = incomeMerchant;
        // user.income = incomeMerchant;
      });
    });
  }
}
