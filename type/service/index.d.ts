interface service {
  [key: string]: (data: any) => Promise<any>;
}

export = service;
