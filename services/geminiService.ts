
// This file now serves as a "Barrel File" (Facade) to export functionality 
// from the modularized services in the `ai` directory.
// This ensures existing components importing from this file continue to work without changes.

export * from './ai/persona';
export * from './ai/strategy';
export * from './ai/research';
export * from './ai/meeting';
export * from './ai/chat';
