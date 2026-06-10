import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Namespace } from 'cls-hooked';
import { RequestContext } from '../context/request-context.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
    constructor(@Inject('REQUEST_NAMESPACE') private readonly ns: Namespace) { }
    use(req: Request & { user?: { sub: number } }, res: Response, next: NextFunction) {
        this.ns.run(() => {
            if (req.user && req.user.sub) {
                RequestContext.setCurrentUserId(req.user.sub);
            }
            next();
        });
    }
}