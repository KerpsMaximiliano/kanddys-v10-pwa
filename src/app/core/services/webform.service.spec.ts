import { TestBed } from '@angular/core/testing';

import { WebformService } from './webform.service';

describe('WebformService', () => {
  let service: WebformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
