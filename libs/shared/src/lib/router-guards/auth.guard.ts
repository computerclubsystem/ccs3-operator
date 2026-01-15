import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { InternalSubjectsService } from '../services/internal-subjects.service';

export const authGuard: CanMatchFn = (route, segments) => {
  const internalSubjectsSvc = inject(InternalSubjectsService);
  const router = inject(Router);

  return internalSubjectsSvc.getSignedIn().pipe(
    map(isSignedIn => {
      if (isSignedIn) {
        return true;
      }
      const attemptedUrl = '/' + segments.map(s => s.path).join('/');
      return router.createUrlTree(['/sign-in'], {
        queryParams: { returnUrl: attemptedUrl },
      });
    }),
  );
};
