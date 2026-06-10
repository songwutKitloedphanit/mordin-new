/// <reference types="react" />
/// <reference types="react-dom" />
import type { Api, Settings } from 'datatables.net';

declare global {
  interface JQuery {
    DataTable: (settings?: Settings) => Api;
  }

  interface JQueryStatic {
    dataTable: never;
    DataTable: {
      isDataTable: (table: Node | JQuery<HTMLElement>) => boolean;
    };
  }
}
