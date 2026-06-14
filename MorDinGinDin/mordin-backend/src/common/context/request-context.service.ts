import { Injectable } from '@nestjs/common';
import { getNamespace, createNamespace } from 'cls-hooked';

@Injectable()
export class RequestContext {
  private static readonly ns = createNamespace('request');

  static set(key: string, value: any): void {
    if (RequestContext.ns.active) {
      RequestContext.ns.set(key, value);
    }
  }

  static get(key: string): any {
    if (RequestContext.ns.active) {
      return RequestContext.ns.get(key);
    }
    return null;
  }

  static get currentUserId(): number {
    return this.get('userId');
  }

  static setCurrentUserId(userId: number): void {
    this.set('userId', userId);
  }
}