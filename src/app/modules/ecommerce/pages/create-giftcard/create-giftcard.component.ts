import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { HeaderService } from 'src/app/core/services/header.service';
import { FormStep } from 'src/app/core/types/multistep-form';

const lightLabelStyles = {
  fontFamily: 'RobotoRegular',
  fontSize: '19px',
  fontWeight: 300,
  marginBottom: '18px',
};

@Component({
  selector: 'app-create-giftcard',
  templateUrl: './create-giftcard.component.html',
  styleUrls: ['./create-giftcard.component.scss'],
})
export class CreateGiftcardComponent implements OnInit, OnDestroy {
  constructor(
    private header: HeaderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  virtual: boolean = false;

  storeEmptyMessageAndGoToShipmentDataForm(params) {
    const emptyPost = {
      message: '',
      targets: [
        {
          name: '',
          emailOrPhone: '',
        },
      ],
      from: '',
      socialNetworks: [
        {
          url: '',
        },
      ],
    };
    this.header.post = emptyPost;

    this.header.storePost(emptyPost);

    if (this.scrollableForm) {
      params.unblockScrollPastCurrentStep();
      params.unblockScrollBeforeCurrentStep();
    }

    this.header.orderProgress.message = true;
    this.header.storeOrderProgress();
    if (this.virtual) {
      this.header.checkoutRoute = `ecommerce/${this.header.saleflow._id}/checkout`;
      this.router.navigate([`../create-article`], {
        relativeTo: this.route,
        replaceUrl: true,
      });
      return { ok: true };
    }
    if (this.header.checkoutRoute) {
      this.router.navigate([this.header.checkoutRoute], {
        replaceUrl: true,
      });
      return { ok: true };
    }
    this.router.navigate([`../new-address`], {
      relativeTo: this.route,
    });
    return { ok: true };
  }

  savePreviousStepsDataBeforeEnteringPreview = (params) => {
    if (!this.addedScrollBlockerBefore && this.scrollableForm) {
      //quita el scroll hacia steps anteriores
      params.unblockScrollBeforeCurrentStep();

      setTimeout(() => {
        params.blockScrollBeforeCurrentStep();
        this.scrollBlockerBefore = params.blockScrollBeforeCurrentStep;
        this.removeScrollBlockerBefore = params.unblockScrollBeforeCurrentStep;
      }, 500);

      params.changeShouldScrollBackwards();

      this.addedScrollBlockerBefore = true;
    }

    this.formSteps[3].fieldsList[0].fieldControl.control.setValue(
      this.formSteps[1].fieldsList[0].fieldControl.control.value
    );
    this.formSteps[3].fieldsList[1].fieldControl.control.setValue(
      this.formSteps[1].fieldsList[1].fieldControl.control.value
    );
    this.formSteps[3].fieldsList[2].fieldControl.control.setValue(
      this.formSteps[1].fieldsList[2].fieldControl.control.value
    );
    this.formSteps[3].fieldsList[3].fieldControl.control.setValue(
      this.formSteps[2].fieldsList[0].fieldControl.control.value
    );

    return { ok: true };
  };

  addedScrollBlockerBefore = false;
  scrollBlockerBefore: any;
  removeScrollBlockerBefore: any;
  scrollableForm = false;
  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'message',
          fieldControl: {
            type: 'single',
            control: new FormControl('', [
              Validators.required,
              Validators.pattern(/[\S]/),
            ]),
          },
          changeCallbackFunction: (...params) => {
            if (
              params[0].trim() &&
              params[1].dataModel.value['1']['receiver'].trim()
            )
              this.formSteps[0].fieldsList[2].disabled = false;
            else this.formSteps[0].fieldsList[2].disabled = true;
          },
          label: 'Mensaje de Regalo (impreso o escrito a mano):',
          inputType: 'textarea',
          placeholder: 'Type..',
          styles: {
            containerStyles: {
              marginBottom: '57px',
              marginTop: '48px',
            },
            fieldStyles: {
              boxShadow: '0px 4px 5px 0px #ddd inset',
              color: '#0b1f38',
              width: '100%',
              fontFamily: 'RobotoMedium',
              height: '164px',
              padding: '23px',
              resize: 'none',
              fontSize: '20px',
              // border: '2px solid #31a4f9',
              borderRadius: '10px',
              backgroundColor: '#fff',
              border: 'none',
            },
            labelStyles: lightLabelStyles,
          },
        },
        {
          name: 'receiver',
          fieldControl: {
            type: 'single',
            control: new FormControl('', [
              Validators.pattern(/[\S]/),
              Validators.required,
            ]),
          },
          changeCallbackFunction: (...params) => {
            if (
              params[0].trim() &&
              params[1].dataModel.value['1']['message'].trim()
            )
              this.formSteps[0].fieldsList[2].disabled = false;
            else this.formSteps[0].fieldsList[2].disabled = true;
          },
          label: 'Nombre del sobre:',
          placeholder: 'Type..',
          styles: {
            labelStyles: lightLabelStyles,
          },
        },
        {
          inputType: 'button',
          name: 'confirmButton',
          fieldControl: {
            type: 'single',
            control: new FormControl(),
          },
          label: 'Adicione el contenido',
          disabled: true,
          styles: {
            containerStyles: {
              width: '89%',
              maxWidth: '445px',
              margin: '248px auto 16px',
              display: 'flex',
              justifyContent: 'center',
            },
            fieldStyles: {
              width: '90%',
              maxWidth: '325px',
              height: '37px',
              borderRadius: '19px',
              backgroundColor: '#2874AD',
              fontFamily: 'SfProBold',
              fontSize: '1rem',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            },
            hoverStyles: {
              width: '90%',
              height: '37px',
              borderRadius: '19px',
              backgroundColor: '#2874AD',
              fontFamily: 'SfProBold',
              fontSize: '1rem',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            },
            disabledStyles: {
              width: '90%',
              maxWidth: '325px',
              height: '37px',
              borderRadius: '19px',
              backgroundColor: '#7B7B7B',
              fontFamily: 'SfProBold',
              fontSize: '1rem',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            },
            labelStyles: {
              fontFamily: 'SfPrBold',
              fontSize: '13px',
              color: '#fff',
            },
          },
        },
      ],
      customHelperHeaderConfig: {
        bgcolor: this.header.colorTheme,
        // justifyContent: 'center',
        // icon: {
        //   src: '/arrow-double-up.svg',
        //   width: 17,
        //   height: 21,
        //   cursor: 'pointer',
        // },
      },
      footerConfig: {
        bgColor: this.header.colorTheme,
      },
      customScrollToStepBackwards: (params) => {
        if (this.scrollableForm) {
          params.unblockScrollPastCurrentStep();
          params.unblockScrollBeforeCurrentStep();
        }

        this.router.navigate(
          [`ecommerce/${this.header.saleflow._id}/checkout`],
          {
            replaceUrl: true,
          }
        );
      },
      asyncStepProcessingFunction: {
        //esto deberia estar en el step 4, el de editar, está en el 2, porque se quizo quitar la foto de este flow
        type: 'promise',
        function: async (params) => {
          if (
            params.dataModel.value['1']['message'] === '' &&
            params.dataModel.value['1']['receiver'] === '' /* &&
            params.dataModel.value['1']['sender'] === '' */
          ) {
            this.storeEmptyMessageAndGoToShipmentDataForm(params);
            return of({
              ok: false,
            });
          }

          const postInput = {
            message: params.dataModel.value['1']['message']?.trim(),
            targets: [
              {
                name: params.dataModel.value['1']['receiver']?.trim(),
                emailOrPhone: '',
              },
            ],
            // from: params.dataModel.value['2']['sender']?.trim(),
            // multimedia: this.header.flowImage,
            socialNetworks: [
              {
                url: '',
              },
            ],
          };

          this.header.post = postInput;
          this.header.storePost(postInput);

          try {
            this.header.orderProgress.message = true;
            this.header.storeOrderProgress();
            if (this.virtual) {
              this.header.checkoutRoute = `ecommerce/${this.header.saleflow._id}/checkout`;
              this.router.navigate([`../create-article`], {
                queryParamsHandling: 'preserve',
                relativeTo: this.route,
                replaceUrl: true,
              });
              return { ok: true };
            }
            if (this.header.checkoutRoute) {
              this.router.navigate([this.header.checkoutRoute], {
                replaceUrl: true,
              });
              return of({
                ok: true,
              });
            }
            this.router.navigate([`../new-address`], {
              relativeTo: this.route,
            });
            return of({
              ok: true,
            });
          } catch (error) {
            console.log('Error creando la orden', error);

            return of({
              ok: false,
            });
          }
        },
      },
      customScrollToStep: (params) => {
        params.scrollToStep(1);
      },
      hideMainStepCTA: true,
      headerMode: 'v2',
      headerTextStyles: {
        marginLeft: '0px',
        fontFamily: 'RobotoMedium',
        fontWeight: 'normal',
        fontSize: '17px',
      },
    },
  ];

  async ngOnInit(): Promise<void> {
    const symbols = this.route.snapshot.queryParamMap.get('symbols');
    if (symbols === 'virtual') {
      this.virtual = true;
    }
    // this.header.flowRoute = `create-giftcard`;
    // localStorage.setItem(
    //   'flowRoute',
    //   `${this.header.saleflow._id}/create-giftcard`
    // );
    const post = this.header.getPost();
    if (post?.targets?.[0]?.name) {
      this.formSteps[1].fieldsList[0].fieldControl.control = new FormControl(
        post.targets[0].name,
        Validators.pattern(/[\S]/)
      );
    }
    if (post?.message) {
      this.formSteps[1].fieldsList[2].fieldControl.control = new FormControl(
        post.message,
        Validators.pattern(/[\S]/)
      );
    }
  }

  ngOnDestroy(): void {
    if (this.addedScrollBlockerBefore && this.scrollableForm) {
      this.removeScrollBlockerBefore();
    }
  }
}
