import {
  Component,
  OnInit,
  Input,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
//import { MultistepFormComponent } from 'src/app/shared/components/multistep-form/multistep-form.component';
import { Observable, of, Subscription } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';

interface FieldStyles {
  fieldStyles?: any;
  containerStyles?: any;
  labelStyles?: any;
  bottomLabelStyles?: any;
  customClassName?: string; //you must use ::ng-deep in the scss of the parent component
}

interface FormField {
  name: string;
  styles?: FieldStyles;
  fieldControl: FormControl | FormArray;
  changeCallbackFunction?(...params): any;
  changeFunctionSubscription?: Subscription;
  selectionOptions?: Array<string>;
  validators?: Array<any>;
  description?: string;
  label: string;
  placeholder?: string;
  inputType?: string;
  showImageBottomLabel?: string;
  multiple?: boolean;
}

interface EmbeddedComponentOutput {
  name: string;
  callback(params: any): any;
}

interface EmbeddedComponent {
  component: Type<any>;
  inputs: Record<string, any>;
  outputs?: Array<EmbeddedComponentOutput>;
  containerStyles?: any;
  afterIndex: number;
}

interface FormStep {
  fieldsList: Array<FormField>;
  headerText: string;
  embeddedComponents?: Array<EmbeddedComponent>;
  accessCondition?(...params): boolean;
  stepButtonValidText: string;
  stepButtonInvalidText: string;
  asyncStepProcessingFunction?(...params): Observable<any>;
  stepProcessingFunction?(...params): any;
  customScrollToStep?(...params): any;
  customScrollToStepBackwards?(...params): any;
  bottomLeftAction?: BottomLeftAction;
  optionalLinksTo?: OptionalLinks;
  stepResult?: any;
}

interface BottomLeftAction {
  text: string;
  execute(params): any;
}

interface OptionalLinks {
  styles?: FieldStyles;
  links: Array<OptionalLink>;
}

interface OptionalLink {
  text: string;
  action(params): any;
}

@Component({
  selector: 'app-shipment-data-form',
  templateUrl: './shipment-data-form.component.html',
  styleUrls: ['./shipment-data-form.component.scss'],
})
export class ShipmentDataFormComponent implements OnInit {
  constructor(private header: HeaderService, private router: Router) {}

  steps: Array<FormStep> = [
    {
      fieldsList: [
        {
          name: 'street',
          fieldControl: new FormControl('', Validators.required),
          label: 'Dónde entregaremos?',
          inputType: 'textarea',
          placeholder: 'Escriba la calle, número, (nombre del edificio)',
          styles: {
            containerStyles: {
              marginTop: '50px',
            },
            fieldStyles: {
              backgroundColor: 'white',
              height: '180px',
              borderRadius: '10px',
            },
            labelStyles: {
              fontWeight: '600',
            },
          },
        },
        {
          name: 'note',
          fieldControl: new FormControl('', Validators.required),
          label: 'Nota',
          inputType: 'textarea',
          placeholder:
            'Ej: Color relevante, algo en común conocido que sirva como referencia...',
          styles: {
            containerStyles: {
              marginTop: '74px',
            },
            fieldStyles: {
              backgroundColor: 'white',
              height: '180px',
              borderRadius: '10px',
            },
            labelStyles: {
              fontWeight: '100',
            },
          },
        },
        // {
        //   name: 'email',
        //   fieldControl: new FormControl(''),
        //   label: 'Email',
        //   inputType: 'email',
        //   placeholder: 'Email',
        //   fieldStyles: {
        //     color: 'green',
        //     marginTop: '10px',
        //   },
        // },
        // {
        //   name: 'imageExample2',
        //   fieldControl: new FormControl(''),
        //   label: 'Sube una imagen',
        //   inputType: 'file',
        //   placeholder: 'sube una imagen',
        // },
      ],
      customScrollToStepBackwards: (params) => {
        params.unblockScrollPastCurrentStep();
        params.unblockScrollBeforeCurrentStep();

        this.router.navigate(['ecommerce/create-giftcard']);
      },
      stepProcessingFunction: (params) => {
        const deliveryData = {
          street: params.dataModel.value['1'].street,
          note: params.dataModel.value['1'].note,
          city: 'Santo Domingo',
        };
        if (
          this.header.order?.products &&
          this.header.order?.products?.length > 0
        )
          this.header.order.products[0].deliveryLocation = deliveryData;
        this.header.storeLocation(this.header.getFlowId(), deliveryData);
        this.header.isComplete.delivery = true;
        this.router.navigate([`ecommerce/flow-completion`]);
        return { ok: true };
      },
      bottomLeftAction: {
        text: 'Sin envio, lo pasaré a recoger',
        execute: () => {
          console.log('Whatever goes here');
        },
      },
      headerText: 'INFORMACION DE LA ENTREGA',
      stepButtonInvalidText: 'ADICIONA DIRECCION DEL ENVIO',
      stepButtonValidText: 'CONTINUAR',
    },
  ];

  ngOnInit(): void {}
}
