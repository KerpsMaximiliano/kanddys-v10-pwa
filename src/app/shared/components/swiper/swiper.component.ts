import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';
import Swiper, { SwiperOptions } from 'swiper';
import { CalendarService } from './../../../core/services/calendar.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';

@Component({
  selector: 'app-swiper',
  templateUrl: './swiper.component.html',
  styleUrls: ['./swiper.component.scss'],
})
export class SwiperComponent implements OnInit {
  realIndex1: number = 0;
  constructor(
    private router: Router,
    public calendars: CalendarService,
    private dialog: DialogService,
    public headerservice: HeaderService
  ) {}

  realIndex: any = 0;
  realMonthIndex: any = 0;

  public slides = [
    'First slide',
    'Second slide',
    'Third slide',
    'Fourth slide',
    'Fifth slide',
    'Sixth slide',
  ];

  public monthsName = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  public daysNumber = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
  ];

  @Input() types = [
    {
      name: 'Mexican',
      active: false,
    },
    {
      name: 'Pizzas',
      active: false,
    },
    {
      name: 'Within Bums',
      active: false,
    },
    {
      name: 'Sushi',
      active: false,
    },
  ];

  id: number = 0;
  @Input() small: boolean = false;
  @Input() medium: boolean = false;
  @Input() large: boolean = false;
  @Input() calendar: boolean = false;
  @Input() days: boolean = false;
  @Input() months: boolean = false;
  @Input() calendar2: boolean = false;
  @Input() otherDays: boolean = false;
  @Input() months2: boolean = false;
  @Input() rounded: boolean = false;
  @Input() smallrounded: boolean = false;
  @Input() larger: boolean = false;
  @Input() singleLarger: boolean = false;
  @Input() productLarge: boolean = false;
  @Input() productLarge1: boolean = false;
  @Input() swiperData: any;
  @Input() packageListData: any;
  @Input() url: string;
  @Input() code: boolean = false;
  @Input() bookmark: boolean = false;
  @Input() sendAgain: boolean = false;
  @Input() uservouchers: boolean = false;
  @Input() options: boolean = false;
  @Input() packItems: boolean = false;
  @Input() packItems1: boolean = false;
  @Input() header: boolean = false;
  @Input() product: boolean = false;
  @Input() stages: boolean = false;
  @Input() edit: boolean = false;
  @Input() test: boolean = false;
  @Input() saleFlowItem: boolean = false;
  @Input() saleFlowTwo: boolean = false;
  @Input() secondClass: boolean = false;
  @Input() perView: number = 5;
  @Input() productCarousel: boolean = false;
  @Input() clubsList: boolean = false;
  @Input() leadwords: boolean = false;
  @Input() leadItem: boolean = false;
  @Input() itemLibrary: boolean = false;
  @Input() itemLibraryData: any;
  @Input() singleItemCard: boolean = false;
  @Input() itemCardData: any;
  /*leadItems data ==>*/ @Input() leadItems: string[] = [];
  @Input() saleFlowTwoData: any;
  @Input() fullScreenSwiper: boolean = false;
  @Input() shadowBellowImage: boolean = false;
  @Input() selectable: boolean;
  @Input() showPrice: boolean = false;
  @Input() showDescription: boolean = false;
  @Output() slideActive = new EventEmitter();
  @Output() toggleEmitter = new EventEmitter();

  color = ['#865396', '#E89452', '#7F7FDE'];
  month: number = 0;
  isLoop: boolean = false;
  env: string = environment.assetsUrl;

  public SmallConfig: SwiperOptions = {
    a11y: { enabled: true },
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 7,
    resistanceRatio: 0,
    freeMode: true,
  };

  public LeadwordsConfig: SwiperOptions = {
    a11y: { enabled: true },
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 7,
    resistanceRatio: 0,
    freeMode: true,
  };

  public itemLibraryConfig: SwiperOptions = {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: -50,
    slideToClickedSlide: true,
  };

  public singleItemCardConfig: SwiperOptions = {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 50,
    slideToClickedSlide: true,
  };

  public saleFlowItemSwiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: -20,
    slideToClickedSlide: true,
  };

  public saleFlowTwoSwiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 5,
  };

  public fullScreenSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    centeredSlides: true,
    slidesPerGroup: 1,
  };

  public clubsListSwiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 20,
    slideToClickedSlide: true,
  };

  public HeaderConfig: SwiperOptions = {
    a11y: { enabled: true },
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 7,
    resistanceRatio: 0,
    freeMode: true,
  };

  public RoundedConfig: SwiperOptions = {
    a11y: { enabled: true },
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 30,
    loop: false,
    freeMode: true,
    resistanceRatio: 0,
  };

  public SmallRoundedConfig: SwiperOptions = {
    a11y: { enabled: true },
    direction: 'horizontal',
    slidesPerView: 'auto',
    loop: false,
    freeMode: true,
    resistanceRatio: 0,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
      hiddenClass: '.swiper-button-hidden',
      disabledClass: '.swiper-button-disabled',
    },
  };

  public MediumConfig: SwiperOptions = {
    a11y: { enabled: true },
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 7,
    freeMode: true,
    resistanceRatio: 0,
  };

  public CalendarConfig: SwiperOptions = {
    slidesPerView: 3,
    centeredSlides: true,
    slidesPerGroup: 1,
    loop: this.isLoop,
    slideToClickedSlide: true,
    on: {
      realIndexChange: function onChange() {
        window.navigator.vibrate(200);
      },
    },
  };

  public monthsConfig: SwiperOptions = {
    slidesPerView: 3,
    centeredSlides: true,
    slidesPerGroup: 1,
    loop: true,
    slideToClickedSlide: true,
    on: {
      realIndexChange: function onChange() {
        window.navigator.vibrate(200);
      },
    },
  };

  public months2Config: SwiperOptions = {
    slidesPerView: 5,
    centeredSlides: true,
    slidesPerGroup: 1,
    loop: true,
    slideToClickedSlide: true,
    on: {
      realIndexChange: function onChange() {
        window.navigator.vibrate(200);
      },
    },
  };

  public daysConfig: SwiperOptions = {
    slidesPerView: this.perView,
    centeredSlides: true,
    slidesPerGroup: 1,
    loop: true,
    slideToClickedSlide: true,
    on: {
      realIndexChange: function onChange() {
        window.navigator.vibrate(200);
      },
    },
  };

  public days2Config: SwiperOptions = {
    slidesPerView: 7,
    centeredSlides: true,
    slidesPerGroup: 1,
    loop: true,
    slideToClickedSlide: true,
  };

  public days3Config: SwiperOptions = {
    slidesPerView: 7,
    centeredSlides: true,
    slidesPerGroup: 1,
    loop: false,
    slideToClickedSlide: true,
  };

  public OptionsConfig: SwiperOptions = {
    slidesPerView: 'auto',
    slidesPerGroup: 1,
    loop: false,
    on: {
      slideChange: function onChange() {
        window.navigator.vibrate(200);
      },
    },
  };
  public ProductConfig: SwiperOptions = {
    slidesPerView: 'auto',
    slidesPerGroup: 1,
    loop: false,
    on: {
      slideChange: function onChange() {
        window.navigator.vibrate(200);
      },
    },
    scrollbar: true,
  };

  public LargeContainer: SwiperOptions = {
    slidesPerView: 'auto',
    centeredSlides: true,
    slidesPerGroup: 1,
    spaceBetween: 15,
    loop: true,
    pagination: true,
  };

  public OtherLargeContainer: SwiperOptions = {
    slidesPerView: 'auto',
    centeredSlides: true,
    slidesPerGroup: 1,
    spaceBetween: 15,
    loop: false,
    pagination: false,
  };

  public LargerContainer: SwiperOptions = {
    slidesPerView: 1,
    centeredSlides: true,
    slidesPerGroup: 1,
    spaceBetween: 15,
    loop: false,
    pagination: true,
  };

  public productLargeOptions: SwiperOptions = {
    slidesPerView: 'auto',
    centeredSlides: true,
    slidesPerGroup: 1,
    spaceBetween: 15,
    loop: true,
  };

  public aaa: SwiperOptions = {
    slidesPerView: 'auto',
    centeredSlides: true,
    slidesPerGroup: 1,
    loop: true,
  };

  public productCarouselConfig: SwiperOptions = {
    slidesPerView: 3,
    centeredSlides: true,
  };

  public leadConfig: SwiperOptions = {
    slidesPerView: 2,
    direction: 'horizontal',
    scrollbar: true,
    grabCursor: true,
  };

  redirect(index) {
    if (this.code) {
      this.router.navigate([this.url + this.swiperData[index].keyword]);
    } else if (this.sendAgain) {
      //this.router.navigate([this.url], {queryParams: {}});
      if (this.swiperData[index].destiny.owner.phone) {
        this.router.navigate([this.url], {
          queryParams: { user: this.swiperData[index].destiny.owner.phone },
        });
      } else if (this.swiperData[index].destiny.owner.email) {
        this.router.navigate([this.url], {
          queryParams: { user: this.swiperData[index].destiny.owner.email },
        });
      }
    } else {
      this.router.navigate([this.url + this.swiperData[index]._id]);
    }
  }

  getPack(i) {
    if (i == this.headerservice.packId) {
      return true;
    } else {
      return false;
    }
  }

  getPack1(i) {
    if (i == this.id) {
      return true;
    } else {
      return false;
    }
  }

  getActive(event, array) {
    this.slideActive.emit(event.realIndex);
    array.forEach((element) => {
      element.status = 'notActive';
    });
    if (event.realIndex <= array.length - 1) {
      array[event.realIndex].status = 'Active';
      this.headerservice.packId = event.realIndex;
      this.id = event.realIndex;
    }
    /*this.headerservice.pack = {
      package: this.headerservice.items[0].params[event.realIndex].name,
      price: this.headerservice.items[0].params[event.realIndex].values[0].price,
      description: this.headerservice.items[0].params[event.realIndex].values[0].name,
      paramId: this.headerservice.items[0].params[event.realIndex]._id,
      pacakgeValueId: this.headerservice.items[0].params[event.realIndex].values[0]._id
    }*/
  }

  getQuantity(e, index: number) {
    //this.entitys[index].quantity = e;
    //console.log(this.entitys[index].quantity);
  }

  vibrate(event?, duration?: number) {
    window.navigator.vibrate(duration ? duration : 100);
  }

  currentSlide(event, changeDay?: boolean, changeHour?: boolean) {
    if (changeDay) {
      this.calendars.dayIndex = event.realIndex;
      this.realIndex = event.realIndex;
      this.calendars.showHours = false;
      this.calendars.hourIndex = 0;
      this.calendars.filterHours();
      if (this.calendars.dayIndex > 0) {
        this.isLoop = true;
      } else {
        this.isLoop = false;
      }
      setTimeout((x) => (this.calendars.showHours = true));
    } else if (changeHour) {
      this.calendars.hourIndex = event.realIndex;
    } else {
      this.calendars.showHours = false;
      this.calendars.showDays = false;
      this.calendars.monthIndex = event.realIndex;
      this.realMonthIndex = event.realIndex;
      this.calendars.hourIndex = 0;
      this.calendars.dayIndex = 0;
      this.calendars.filterDays();
      setTimeout((x) => (this.calendars.showHours = true));
      setTimeout((x) => (this.calendars.showDays = true));
    }
    this.vibrate();
  }

  setActive(index) {
    for (let i = 0; i < this.types.length; i++) {
      this.types[i].active = false;
    }
    this.types[index].active = !this.types[index].active;
  }

  setActive1(event) {
  }

  ngOnInit(): void {
  }

  openImageModal(imageSourceURL: string) {
    this.dialog.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  goToLink(url: string) {
    window.open(url, '_blank');
  }

  onChange() {
  }

  zorroChange(string) {
    let date = new Date();
    let offset = date.getTimezoneOffset() / 60;
    string = parseInt(string.split(':')[0]) + 1;
    string = string.toString() + ':' + '00';
    string = parseInt(string.split(':')[0]) - 1;
    if (string > 9) {
      string = (string - offset).toString() + ':' + '45';
    } else {
      string = (string - offset).toString() + ':' + '45';
    }
    return string;
  }

  zorroChange2(string) {
    let date = new Date();
    let offset = date.getTimezoneOffset() / 60;
    string = parseInt(string.split(':')[0]);
    if (string > 9) {
      string = (string - offset).toString() + ':' + '00';
    } else {
      string = (string - offset).toString() + ':' + '00';
    }
    return string;
  }

  zorroChange5(string) {
    string = parseInt(string.split(':')[0]);
    if (string > 9) {
      string = string.toString() + ':' + '00';
    } else {
      string = string.toString() + ':' + '00';
    }
    return string;
  }

  zorroChange6(string) {
    string = parseInt(string.split(':')[0]);
    if (string > 9) {
      string = string.toString() + ':' + '45';
    } else {
      string = string.toString() + ':' + '45';
    }
    return string;
  }

  getActive2(event) {
    this.slideActive.emit(event);
  }

  toggleSelected(event) {
    this.toggleEmitter.emit(event);
  }

  currentSlide2(event) {
    this.slideActive.emit(event);
  }

  currentSlide3(event) {
    this.realIndex1 = event.realIndex;
  }

  goToGift(itemId: string) {
    this.router.navigate(['ecommerce/gift-detail/' + itemId]);
  }
}
