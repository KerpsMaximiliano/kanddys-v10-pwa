import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { DeliveryLocation, SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { UsersService } from 'src/app/core/services/users.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
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
    private dialogService: DialogService,
    private headerService: HeaderService,
    private authService: AuthService,
    private fb: FormBuilder,
    private usersService: UsersService,
    private location: Location,
    private toastr: ToastrService
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
      houseNumber: fb.control(null, Validators.pattern(/[\S]/)),
      referencePoint: fb.control(null, Validators.pattern(/[\S]/)),
      note: fb.control(null, Validators.pattern(/[\S]/)),
    });
    this.loggedIn = this.router.getCurrentNavigation().extras.state?.loggedIn;
  }
  mode: 'normal' | 'add' | 'delete' | 'edit' | 'auth' = 'auth';
  editingId: string;
  loggedIn: boolean;
  disableButton: boolean;
  env = environment.assetsUrl;
  itemCartAmount: number;
  addresses: DeliveryLocation[] = [];
  addressesOptions: OptionAnswerSelector[] = [];
  newAddressOption: OptionAnswerSelector[] = [];
  authOptions: OptionAnswerSelector[] = [
    {
      status: true,
      id: 'continue',
      value: 'Continuar de forma anónima',
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
      subtexts: [
        {
          text: 'Escribes y re-escribes datos como las direcciones, formas de pagos etc.. ',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1rem',
          },
        },
      ],
    },
    {
      status: true,
      id: 'toLogin',
      value: 'Login o crea tu nueva cuenta',
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
      subtexts: [
        {
          text: 'Ganas puntos. No re-escribes direcciones. Es simple (muy simple).',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1rem',
          },
        },
      ],
    },
  ];
  saleflow: SaleFlow;
  selectedDeliveryIndex: number;
  selectedAuthIndex: number;
  user: User;

  async ngOnInit(): Promise<void> {
    this.saleflow = this.headerService.getSaleflow();
    if (this.loggedIn) this.checkAddresses();
    this.user = await this.authService.me();
    if (this.user) {
      this.authOptions.push({
        status: true,
        id: 'withUser',
        value: `Continuar como ${this.user.name}`,
        valueStyles: {
          fontFamily: 'SfProBold',
          fontSize: '0.875rem',
          color: '#000000',
        },
        subtexts: [
          {
            text: 'Sigues ganando Kanddys. Seleccionas entre tus direcciones sin re-escribirlas',
            styles: {
              fontFamily: 'SfProRegular',
              fontSize: '1rem',
            },
          },
        ],
      });
    }
    this.headerService.order = this.headerService.getOrder(this.saleflow._id);
    this.itemCartAmount = this.headerService.order?.products?.length;
    this.addresses.push(...this.saleflow.module.delivery.pickUpLocations);
    this.saleflow.module.delivery.pickUpLocations?.forEach((pickup) => {
      this.addressesOptions.push({
        status: true,
        id: pickup._id,
        value: 'Pick up. Lo pasaré a recoger',
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
    });
    // if (!this.user) return;
    if (!this.saleflow.module?.delivery?.deliveryLocation) return;
    this.newAddressOption.push({
      status: true,
      value: 'Agregar nueva dirección',
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
    });
    this.addresses.push(...this.user.deliveryLocations);
    if (this.user) {
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
  }

  selectAddress() {
    const { _id, ...addressInput } = this.addresses[this.selectedDeliveryIndex];
    this.headerService.order.products.forEach((product) => {
      product.deliveryLocation = addressInput;
    });
    this.headerService.storeLocation(
      this.headerService.getSaleflow()._id,
      addressInput
    );
    this.headerService.isComplete.delivery = true;
    this.headerService.storeOrderProgress(
      this.headerService.saleflow?._id || this.headerService.getSaleflow()?._id
    );
    this.router.navigate(['ecommerce/checkout']);
  }

  authSelect(index: Number) {
    switch (index) {
      case 0:
        if (this.user || this.headerService.user) {
          this.authService.signoutThree();
          this.addressesOptions.length = 1;
          this.newAddressOption = null;
          this.user = null;
        }
        this.headerService.storeOrderAnonymous(this.saleflow._id);
        this.checkAddresses(true);
        break;

      case 1:
        this.headerService.deleteOrderAnonymous(this.saleflow._id);
        this.router.navigate([`auth/login`], {
          queryParams: { auth: 'order', saleflow: this.saleflow._id },
        });
        break;

      case 2:
        this.headerService.deleteOrderAnonymous(this.saleflow._id);
        this.checkAddresses();
        break;
    }
  }

  checkAddresses(isAnon?: boolean) {
    if (!this.headerService.saleflow.module?.delivery?.isActive) {
      this.toastr.info('Este Saleflow no contiene delivery o pick-up.', null, {
        timeOut: 3000,
        positionClass: 'toast-top-center',
      });
      this.router.navigate([`ecommerce/checkout`]);
      return;
    }
    if (
      this.headerService.saleflow.module.delivery.pickUpLocations.length > 1 ||
      (this.headerService.saleflow.module.delivery.deliveryLocation)
    ) {
      this.mode = 'normal';
      return;
    }
    if (
      this.headerService.saleflow.module.delivery.pickUpLocations.length ===
        1 &&
      (!this.headerService.saleflow.module.delivery.deliveryLocation || isAnon)
    ) {
      const { _id, ...addressInput } =
        this.headerService.saleflow.module.delivery.pickUpLocations[0];
      this.headerService.order.products.forEach((product) => {
        product.deliveryLocation = addressInput;
      });
      this.headerService.storeLocation(
        this.headerService.getSaleflow()._id,
        addressInput
      );
      this.headerService.isComplete.delivery = true;
      this.headerService.storeOrderProgress(
        this.headerService.saleflow?._id ||
          this.headerService.getSaleflow()?._id
      );
      this.toastr.info(
        'Se ha seleccionado la única opción para pick-up',
        !this.headerService.saleflow.module.delivery.deliveryLocation
          ? 'Este Saleflow no contiene delivery'
          : 'Has decidido hacer la orden de forma anónima',
        {
          timeOut: 5000,
          positionClass: 'toast-top-center',
        }
      );
      this.router.navigate(['ecommerce/checkout']);
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
    };
    if (this.user) {
      result = await this.usersService.addLocation(newAddress);
    } else result = newAddress;
    if (!result) return;
    const newAddressOption = {
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
      this.addressesOptions[optionIndex] = newAddressOption;
    } else {
      this.addresses.push(result);
      this.addressesOptions.push(newAddressOption);
      this.selectedDeliveryIndex = this.addresses.length - 1;
      this.selectAddress();
    }
    this.disableButton = false;
    unlockUI();
    this.goBack();
  }

  goBack() {
    if (this.mode === 'auth') return this.location.back();
    if (this.mode === 'normal') return (this.mode = 'auth');
    this.mode = 'normal';
    this.editingId = null;
    this.addressForm.reset();
    this.addressesOptions.forEach((option) => (option.icons = null));
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

  showShoppingCartDialog = () => {
    this.dialogService.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        orderFinished: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };
}
