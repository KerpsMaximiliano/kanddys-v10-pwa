import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import {
  DeliveryLocation,
  DeliveryLocationInput,
} from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { ViewsMerchant } from 'src/app/core/models/views-merchant';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  HeaderService,
  SaleflowData,
} from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { UsersService } from 'src/app/core/services/users.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-address',
  templateUrl: './new-address.component.html',
  styleUrls: ['./new-address.component.scss'],
})
export class NewAddressComponent implements OnInit {
  addressForm: FormGroup;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    public headerService: HeaderService,
    private authService: AuthService,
    private fb: FormBuilder,
    private usersService: UsersService,
    private toastr: ToastrService,
    private merchantsService: MerchantsService,
    private matDialog: MatDialog
  ) {
    this.addressForm = fb.group({
      nickName: fb.control('Mi casa', [
        Validators.required,
        Validators.pattern(/[\S]/),
      ]),
      street: fb.control(null, [
        Validators.required,
        Validators.pattern(/[\S]/),
      ]),
      houseNumber: fb.control(null, [
        Validators.pattern(/[\S]/),
        Validators.min(1),
      ]),
      referencePoint: fb.control(null, Validators.pattern(/[\S]/)),
      note: fb.control(null, Validators.pattern(/[\S]/)),
      save: fb.control(false),
    });
    this.loggedIn = this.router.getCurrentNavigation()?.extras?.state?.loggedIn;
    this.registered = JSON.parse(
      localStorage.getItem('registered-user')
    ) as User;
  }
  mode: 'normal' | 'add' | 'delete' | 'edit' = 'normal';
  flow: 'cart' | 'checkout' | 'unAnsweredQuestions' = 'checkout';
  messageFlow:
  | 'VIRTUAL-MESSAGE'
  | 'TRADITIONAL-MESSAGE'
  | 'TRADITIONAL-AND-VIRTUAL';
  editingId: string;
  loggedIn: boolean;
  registered: User;
  disableButton: boolean;
  user: User;
  env = environment.assetsUrl;
  addresses: DeliveryLocation[] = [];
  addressesOptions: OptionAnswerSelector[] = [];
  newAddressOption: OptionAnswerSelector[] = [];
  authOptions: OptionAnswerSelector[] = [
    {
      status: true,
      id: 'withUser',
      value: 'Selecciona entre mis direcciones guardadas',
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
      subtexts: [
        {
          text: 'Ver direcciones que he guardado y seleccionar entre ellas',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1rem',
          },
        },
      ],
    },
  ];
  selectedDeliveryIndex: number;
  // selectedAuthIndex: number;
  magicLinkLocation: DeliveryLocationInput;
  viewMerchantForDelivery: ViewsMerchant = null;

  async ngOnInit(): Promise<void> {
    const magicLinkData = this.route.snapshot.queryParamMap.get('data');
    const flow = this.route.snapshot.queryParamMap.get('flow');
    const messageFlow = this.route.snapshot.queryParamMap.get('messageFlow');

    if (flow) this.flow = flow as 'cart' | 'checkout' | 'unAnsweredQuestions';
    if (messageFlow) this.messageFlow = messageFlow as any;

    if (magicLinkData) {
      const orderData = JSON.parse(
        decodeURIComponent(magicLinkData)
      ) as SaleflowData;
      if (orderData?.order?.products?.[0]) {
        localStorage.setItem(
          this.headerService.saleflow._id,
          JSON.stringify(orderData)
        );
        this.magicLinkLocation = orderData.deliveryLocation;
        this.router.navigate([], {
          relativeTo: this.route,
        });
      }
    }
    this.checkAddresses();
    this.user = await this.authService.me();
    this.onInitSetup();
    if (this.magicLinkLocation) {
      setTimeout(() => {
        this.addressForm.patchValue({ ...this.magicLinkLocation, save: true });
        this.mode = 'add';
        this.formSubmit();
      }, 100);
    }

    const viewsMerchants = await this.merchantsService.viewsMerchants({
      findBy: {
        merchant: this.headerService.saleflow.merchant._id,
        type: 'delivery-politics',
      },
    });

    if (viewsMerchants && viewsMerchants.length > 0) {
      this.viewMerchantForDelivery = viewsMerchants[0];
    }
  }

  onInitSetup() {
    this.addresses = [];
    this.addressesOptions = [];
    this.newAddressOption = [];
    if (this.headerService.saleflow.module?.delivery?.pickUpLocations?.length) {
      this.addresses.push(
        ...this.headerService.saleflow.module.delivery.pickUpLocations
      );
      this.headerService.saleflow.module.delivery.pickUpLocations?.forEach(
        (pickup) => {
          this.addressesOptions.push({
            status: true,
            id: pickup._id,
            value: 'Pick Up. Pasaré a recoger',
            valueStyles: {
              fontFamily: 'SfProBold',
              fontSize: '0.875rem',
              color: '#000000',
            },
            subtexts: [
              {
                text: pickup.nickName,
                styles: {
                  fontFamily: 'SfProRegular',
                  fontSize: '1rem',
                },
              },
            ],
          });
        }
      );
    }
    // if (!this.user) return;
    if (!this.headerService.saleflow.module?.delivery?.deliveryLocation) return;
    this.newAddressOption.push({
      status: true,
      value: 'Adiciona una nueva dirección',
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
    });

    // TODO: meter esto dentro del if de abajo
    if (this.user) {
      this.addresses.push(...this.user.deliveryLocations);
      this.user.deliveryLocations?.forEach((locations) => {
        this.addressesOptions.push({
          status: true,
          id: locations._id,
          click: true,
          value: locations.nickName,
          valueStyles: {
            fontFamily: 'SfProBold',
            fontSize: '0.875rem',
            color: '#000000',
          },
          subtexts: [
            {
              text: `${locations.street}, ${locations.city}, República Dominicana`,
              styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
              },
            },
          ],
        });
      });
    }
  }

  onOpenDialog = () => {
    const list: StoreShareList[] = [
      {
        title: 'HERRAMIENTAS',
        options: [
          {
            text: 'ADICIONAR',
            mode: 'func',
            func: () => {
              this.mode = 'add';
            },
          },
        ],
      },
    ];
    if (this.addressesOptions.some((option) => option.click)) {
      list[0].options.push(
        {
          text: 'EDITAR',
          mode: 'func',
          func: () => {
            this.mode = 'edit';
            this.addressesOptions.forEach((option) => {
              if (option.click) {
                option.icons = [
                  {
                    src: this.env + '/pencil.svg',
                    callback: () => {
                      this.mode = 'edit';
                      this.editingId = option.id;
                      this.addressForm.patchValue(
                        this.addresses.find(
                          (address) => address._id === option.id
                        )
                      );
                    },
                  },
                ];
              } else {
                option.hidden = true;
              }
            });
          },
        },
        {
          text: 'BORRAR',
          mode: 'func',
          func: () => {
            this.mode = 'delete';
            this.addressesOptions.forEach((option) => {
              if (option.click) {
                option.icons = [
                  {
                    src: this.env + '/delete.svg',
                    callback: async () => {
                      this.openDeleteDialog(option.id);
                    },
                    styles: {
                      width: '16px',
                      height: '19px',
                    },
                  },
                ];
              } else {
                option.hidden = true;
              }
            });
          },
        }
      );
    }

    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  filterLocations(id: string) {
    this.addressesOptions = this.addressesOptions.filter(
      (option) => option.id !== id
    );
    if (
      this.selectedDeliveryIndex != null &&
      this.addresses[this.selectedDeliveryIndex]._id === id
    )
      this.selectedDeliveryIndex = null;
    this.addresses = this.addresses.filter((address) => address._id !== id);
    if (this.addressesOptions.length === 1) this.goBack();
  }

  selectAddress(
    save?: boolean,
    loginData?: {
      result: DeliveryLocation;
      addedAddressOption: any;
    }
  ) {
    const { _id, ...addressInput } =
      this.addresses[this.selectedDeliveryIndex] || loginData.result;
    addressInput.type = 'default';
    this.headerService.order.products[0].deliveryLocation = addressInput;
    this.headerService.storeLocation(addressInput);
    this.headerService.orderProgress.delivery = true;
    this.headerService.storeOrderProgress();

    //console.log('this.headerService.user', this.headerService.user);

    console.log(this.headerService.user, save)

    if (save && !this.headerService.user) {
      // this.authSelect('address');

      const matDialogRef = this.matDialog.open(LoginDialogComponent, {
        data: {
          magicLinkData: {
            redirectionRoute: `ecommerce/${this.headerService.saleflow.merchant.slug}/new-address`,
            entity: 'NonExistingOrder',
            redirectionRouteQueryParams: {
              data: localStorage.getItem(this.headerService.saleflow._id),
            },
          },
          extraUserInput: {
            deliveryLocations: [addressInput],
          },
        } as LoginDialogData,
      });
      matDialogRef.afterClosed().subscribe((result) => {
        if (!result) return;
        this.user = result.user || result.session.user;
        if (this.user) this.onInitSetup();
        this.addresses.push(loginData.result);
        this.addressesOptions.push(loginData.addedAddressOption);
        this.selectedDeliveryIndex = this.addresses.length - 1;
        if (!result.new) this.usersService.addLocation(loginData.result);
        this.router.navigate([`../checkout`], {
          replaceUrl: this.headerService.checkoutRoute ? true : false,
          relativeTo: this.route,
        });
      });

      return;
    }

    if (this.flow === 'cart' || this.flow === 'unAnsweredQuestions') {
      const isAppointmentActive =
        this.headerService.saleflow.module.appointment?.isActive;


      console.log(addressInput);
      console.log(this.addresses);
      console.log(this.addresses[this.selectedDeliveryIndex]);

      let redirectionRoute = addressInput.street
        ? `../receiver-form` 
        : isAppointmentActive
        ? `../reservations/${this.headerService.saleflow.module.appointment.calendar._id}`
        : `../checkout`;

      this.router.navigate([redirectionRoute], {
        relativeTo: this.route,
        queryParams: isAppointmentActive
          ? {
              saleflowId: this.headerService.saleflow._id,
              flow: this.flow,
              messageFlow: this.messageFlow ? this.messageFlow : null,
            }
          : {},
      });
    } else {
      this.router.navigate([`../checkout`], {
        replaceUrl: this.headerService.checkoutRoute ? true : false,
        relativeTo: this.route,
      });
    }
  }

  authSelect(auth: 'order' | 'address') {
    this.router.navigate([`auth/login`], {
      queryParams: { auth, saleflow: this.headerService.saleflow._id },
    });
  }

  openLoginDialog() {
    const matDialogRef = this.matDialog.open(LoginDialogComponent, {
      data: {
        magicLinkData: {
          redirectionRoute: `ecommerce/${this.headerService.saleflow.merchant.slug}/new-address?flow=${this.flow}&messageFlow=${this.messageFlow ? this.messageFlow : null}`,
          entity: 'NonExistingOrder',
          redirectionRouteQueryParams: {
            data: localStorage.getItem(this.headerService.saleflow._id),
          },
        },
      } as LoginDialogData,
    });
    matDialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.user = result.user || result.session.user;
      if (this.user) this.onInitSetup();
    });
  }

  checkAddresses() {
    if (!this.headerService.saleflow.module?.delivery?.isActive) {
      this.toastr.info('Esta tienda no contiene delivery o pick-up.', null, {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });

      if (this.flow === 'cart' || this.flow === 'unAnsweredQuestions') {

        const isAppointmentActive =
        this.headerService.saleflow.module.appointment?.isActive;

        const redirectionRoute = this.addresses[this.selectedDeliveryIndex].street
          ? `../receiver-form` 
          : isAppointmentActive
          ? `../reservations/${this.headerService.saleflow.module.appointment.calendar._id}`
          : `../checkout`;

        this.router.navigate(
          [
            `${redirectionRoute}`
          ],
          {
            relativeTo: this.route,
            queryParams: {
              saleflowId: this.headerService.saleflow._id,
              flow: this.flow,
              messageFlow: this.messageFlow ? this.messageFlow : null,
            },
          }
        );
      } else {
        this.router.navigate([`../checkout`], {
          replaceUrl: this.headerService.checkoutRoute ? true : false,
          relativeTo: this.route,
        });
        return;
      }
    }
    if (
      this.headerService.saleflow.module.delivery.pickUpLocations.length > 1 ||
      this.headerService.saleflow.module.delivery.deliveryLocation
    ) {
      this.mode = 'normal';
      return;
    }
    if (
      this.headerService.saleflow.module.delivery.pickUpLocations.length ===
        1 &&
      !this.headerService.saleflow.module.delivery.deliveryLocation
    ) {
      const { _id, ...addressInput } =
        this.headerService.saleflow.module.delivery.pickUpLocations[0];
      this.headerService.order.products.forEach((product) => {
        product.deliveryLocation = addressInput;
      });
      this.headerService.storeLocation(addressInput);
      this.headerService.orderProgress.delivery = true;
      this.headerService.storeOrderProgress();
      this.toastr.info(
        'Se ha seleccionado la única opción para pick-up',
        'Esta tienda no contiene delivery',
        {
          timeOut: 5000,
          positionClass: 'toast-top-center',
        }
      );

      if (this.flow === 'cart' || this.flow === 'unAnsweredQuestions') {

        const isAppointmentActive =
        this.headerService.saleflow.module.appointment?.isActive;

        const redirectionRoute = isAppointmentActive
          ? `../reservations/${this.headerService.saleflow.module.appointment.calendar._id}`
          : `../checkout`;

        this.router.navigate(
          [
            `${redirectionRoute}`,
          ],
          {
            relativeTo: this.route,
            queryParams: {
              saleflowId: this.headerService.saleflow._id,
              flow: this.flow,
              messageFlow: this.messageFlow ? this.messageFlow : null,
            },
          }
        );
      } else {
        this.router.navigate([`../checkout`], {
          replaceUrl: true,
          relativeTo: this.route,
        });
      }
    }
  }

  async formSubmit() {
    if (this.addressForm.invalid) return;
    this.disableButton = true;
    lockUI();
    let result: DeliveryLocation;
    if (this.mode === 'edit')
      await this.usersService.deleteLocation(this.editingId);
    const newAddress = {
      nickName: this.addressForm.value.nickName.trim(),
      street: this.addressForm.value.street.trim(),
      houseNumber: this.addressForm.value.houseNumber?.toString(),
      referencePoint: this.addressForm.value.referencePoint?.trim(),
      note: this.addressForm.value.note?.trim(),
      city: 'Santo Domingo',
      type: 'default' as any,
    };
    if (
      this.headerService.user &&
      (this.addressForm.value.save || this.mode === 'edit')
    ) {
      result = await this.usersService.addLocation(newAddress);
    } else result = newAddress;
    const addedAddressOption = {
      status: true,
      id: result._id,
      click: true,
      value: result.nickName,
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
      subtexts: [
        {
          text: `${result.street}, ${result.city}, República Dominicana`,
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1rem',
          },
        },
      ],
    };
    if (this.mode === 'edit') {
      const addressIndex = this.addresses.findIndex(
        (address) => address._id === this.editingId
      );
      const optionIndex = this.addressesOptions.findIndex(
        (option) => option.id === this.editingId
      );
      this.addresses[addressIndex] = result;
      this.addressesOptions[optionIndex] = addedAddressOption;
    } else {
      if (this.headerService.user) {
        this.addresses.push(result);
        this.addressesOptions.push(addedAddressOption);
        this.selectedDeliveryIndex = this.addresses.length - 1;
      }
      this.selectAddress(this.addressForm.value.save, {
        result,
        addedAddressOption,
      });
    }
    this.disableButton = false;
    unlockUI();
    this.goBack();
  }

  goBack() {
    if (this.mode === 'normal') {
      if (this.flow === 'cart') {
        if (this.messageFlow) {
          return this.router.navigate([`../new-symbol`], {
            relativeTo: this.route,
            queryParams: {
              type: this.messageFlow === 'TRADITIONAL-MESSAGE' ?
                'traditional' :
                this.messageFlow === 'TRADITIONAL-AND-VIRTUAL' ?
                'both' : 'virtual'
            }
          });
        }

        return this.router.navigate([`../cart`], {
          relativeTo: this.route,
          queryParams: {
            // TODO incluir query param de flow de supplier
          }
        });
      } else if (this.flow === 'unAnsweredQuestions') {
        return this.router.navigate([`../cart`], {
          relativeTo: this.route,
        });
      } else {
        return this.router.navigate([`../checkout`], {
          relativeTo: this.route,
        });
      }
    }
    this.mode = 'normal';
    this.editingId = null;
    this.addressForm.reset({
      nickName: this.addressForm.get('nickName').value,
    });
    this.addressesOptions.forEach((option) => {
      option.icons = null;
      option.hidden = false;
    });
  }

  openDeleteDialog(id: string) {
    const address = this.addresses.find((address) => address._id === id);
    const list: StoreShareList[] = [
      {
        title: `Eliminar ${address.nickName}?`,
        description:
          'Esta acción es irreversible, estás seguro que deseas eliminar esta dirección?',
        message: 'Eliminar',
        messageCallback: async () => {
          await this.usersService.deleteLocation(address._id);
          this.filterLocations(address._id);
        },
      },
    ];

    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  goToShippingPolicies() {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.headerService.flowRoute);

    this.router.navigate([
      `/ecommerce/${this.headerService.saleflow.merchant.slug}/terms-of-use/${this.viewMerchantForDelivery._id}`,
    ]);
  }

  handleData(event): void {
    this.selectedDeliveryIndex = event;
    this.selectAddress();
  }
}
