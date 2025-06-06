declare module 'xss-clean' {
  function xssClean(): (req: any, res: any, next: () => void) => void;
  export = xssClean;
}
