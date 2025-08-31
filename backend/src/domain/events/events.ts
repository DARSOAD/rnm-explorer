export const EVENTS = {
  CharactersListed: "CharactersListed",
  CharacterViewed: "CharacterViewed",
  CharacterFavorited: "CharacterFavorited",
  CommentAdded: "CommentAdded",
} as const;

export type EventName = keyof typeof EVENTS;

export interface DomainEvent<T = any> {
  type: string;   
  payload: T;       
  occurredAt: Date; 
}
