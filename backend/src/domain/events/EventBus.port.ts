export interface DomainEvent<T = any> {
    type: string;
    payload: T;
    at: Date;
  }
  
  export interface EventBus {
    publish<T>(event: DomainEvent<T>): void;
    subscribe(type: string, handler: (e: DomainEvent) => void): void;
  }
  