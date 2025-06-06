declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  function xss(): RequestHandler;
  export = xss;
}

declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';
  function mongoSanitize(): RequestHandler;
  export = mongoSanitize;
}

declare module 'winston-daily-rotate-file' {
  import { TransportStreamOptions } from 'winston-transport';
  
  interface DailyRotateFileTransportOptions extends TransportStreamOptions {
    filename?: string;
    datePattern?: string;
    zippedArchive?: boolean;
    maxSize?: string;
    maxFiles?: string;
    createSymlink?: boolean;
    symlinkName?: string;
    auditFile?: string;
    utc?: boolean;
    extension?: string;
    createTree?: boolean;
    frequency?: string;
    verbose?: boolean;
    stream?: NodeJS.WritableStream;
    options?: object;
  }

  class DailyRotateFile {
    constructor(options?: DailyRotateFileTransportOptions);
  }

  export = DailyRotateFile;
}

declare module 'slugify' {
  interface SlugifyOptions {
    replacement?: string;
    remove?: RegExp;
    lower?: boolean;
    strict?: boolean;
    locale?: string;
    trim?: boolean;
  }

  function slugify(string: string, options?: SlugifyOptions): string;
  export = slugify;
}