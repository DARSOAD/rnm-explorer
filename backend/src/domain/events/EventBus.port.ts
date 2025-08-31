import type { DomainEvent } from "./events";

  
export interface EventBus {
    publish<T>(event: DomainEvent<T>): void;
    subscribe(type: string, handler: (e: DomainEvent) => void): void;
  }
  