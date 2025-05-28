import { Router, RequestHandler, NextFunction, Request, Response } from 'express';
import { Service } from 'typedi';

type Middleware = RequestHandler | RequestHandler[];

export interface RouteDefinition {
  path: string;
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  handler: RequestHandler;
  middlewares?: Middleware[];
}

@Service()
export abstract class BaseRoutes {
  public path: string;
  public router: Router;

  constructor(path: string) {
    this.path = path;
    this.router = Router();
    this.initializeRoutes();
  }

  protected abstract getRoutes(): RouteDefinition[];

  protected initializeRoutes(): void {
    const routes = this.getRoutes();
    routes.forEach(route => {
      const { path, method, handler, middlewares = [] } = route;
      const fullPath = `${this.path}${path}`;
      
      // Flatten and apply middlewares
      const flattenedMiddlewares = middlewares.flat();
      let currentHandler = handler;
      
      for (let i = flattenedMiddlewares.length - 1; i >= 0; i--) {
        const middleware = flattenedMiddlewares[i];
        const nextHandler = currentHandler;
        currentHandler = (req: Request, res: Response, next: NextFunction) => {
          middleware(req, res, (err?: any) => {
            if (err) {
              next(err);
            } else {
              nextHandler(req, res, next);
            }
          });
        };
      }
      
      this.router[method](fullPath, currentHandler);
    });
  }

  protected createRoute(
    path: string,
    method: RouteDefinition['method'],
    handler: RequestHandler,
    middlewares: Middleware[] = []
  ): RouteDefinition {
    return { path, method, handler, middlewares };
  }
} 