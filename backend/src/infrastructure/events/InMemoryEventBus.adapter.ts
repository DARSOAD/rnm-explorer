import type { DomainEvent, EventBus } from "../../domain/events/EventBus.port";

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<(e: DomainEvent) => void>>();

  publish<T>(event: DomainEvent<T>): void {
    const hs = this.handlers.get(event.type);
    if (!hs) return;
    for (const h of hs) {
      try { h(event); } catch (err) { /* log si quieres */ }
    }
  }

  subscribe(type: string, handler: (e: DomainEvent) => void): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }
}
