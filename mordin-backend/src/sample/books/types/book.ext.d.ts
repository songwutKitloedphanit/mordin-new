import { Book } from "../entities/book.entity";

declare module "../entities/book.entity" {
  interface Book {
    removedBy?: number;
  }
}
