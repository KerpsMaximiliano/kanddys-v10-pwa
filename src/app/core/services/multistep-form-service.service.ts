import { Injectable } from '@angular/core';
import { FormStep } from '../types/multistep-form';

export interface MultistepFormStorage {
  reference: FormStep[];
  essentialData: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class MultistepFormServiceService {
  dataModel: Record<string, MultistepFormStorage> = {};

  constructor() { 
  }

  storeMultistepFormData(
    name: string, 
    multistepForm: FormStep[],
    essentialData: Record<string, any>
  ) {
    this.dataModel[name] = {
      reference: multistepForm,
      essentialData
    };
  }

  getMultiStepFormData(name: string): MultistepFormStorage {
    return this.dataModel[name] ? this.dataModel[name] : null;
  }

  removeMultiStepFormData(name: string) {
    this.dataModel[name] = null;
  }
}
