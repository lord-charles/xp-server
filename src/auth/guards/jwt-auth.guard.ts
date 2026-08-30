import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { BillingService } from '../../billing/billing.service';
import { SUBSCRIPTION_EXEMPT_KEY } from '../../billing/decorators/subscription-exempt.decorator';
import { isObservable, lastValueFrom } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const activation = super.canActivate(context);
    const authenticated = isObservable(activation)
      ? await lastValueFrom(activation)
      : await activation;
    const exempt = this.reflector.getAllAndOverride<boolean>(
      SUBSCRIPTION_EXEMPT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (exempt) return authenticated;
    const user = context.switchToHttp().getRequest().user;
    // The guard is reused in every feature module. Resolving from the root
    // container avoids making every module import BillingModule.
    const billing = this.moduleRef.get(BillingService, { strict: false });
    const access =
      user?.userType === 'employee'
        ? await billing.getEmployeeAccess(user.id)
        : await billing.getAccess(user);
    if (!access.allowed)
      throw new ForbiddenException({
        code: 'SUBSCRIPTION_REQUIRED',
        message:
          'This subscription is not active. Open billing to make a payment.',
        billing: access,
      });
    return authenticated;
  }
}
