import { TestBed, inject } from '@angular/core/testing';

import { DeetiService } from './deeti.service';

describe('DeetiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DeetiService]
    });
  });

  it('should be created', inject([DeetiService], (service: DeetiService) => {
    expect(service).toBeTruthy();
  }));
});
