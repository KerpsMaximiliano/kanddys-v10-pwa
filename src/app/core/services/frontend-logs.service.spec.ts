import { TestBed } from '@angular/core/testing';

import { FrontendLogsService } from './frontend-logs.service';

describe('FrontendLogsService', () => {
  let service: FrontendLogsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FrontendLogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
