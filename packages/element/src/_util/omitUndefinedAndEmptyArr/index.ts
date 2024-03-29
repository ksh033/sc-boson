const omitUndefinedAndEmptyArr = <T>(obj: T): T => {
  const newObj = {} as T;
  Object.keys(obj || {}).forEach((key) => {
    if (Array.isArray(obj[key]) && obj[key]?.length === 0) {
      return;
    }
    if (obj[key] == null || String(obj[key]).trim() === '') {
      return;
    }
    newObj[key] = obj[key];
  });
  return newObj;
};

export default omitUndefinedAndEmptyArr;
