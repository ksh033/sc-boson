function emptyRequest(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(null);
    });
  
  }

  export {

    emptyRequest

  }