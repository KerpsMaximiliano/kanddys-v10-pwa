import { TestBed } from '@angular/core/testing';

import { QueryparametersService } from './queryparameters.service';

describe('QueryparametersService', () => {
  let service: QueryparametersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryparametersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
