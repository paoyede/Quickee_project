export const Validation = <T extends Record<string, any>>(
  payload: T
): string[] => {
  const emptyOrNullFields: string[] = [];

  Object.entries(payload).forEach(([key, value]) => {
    if (
      payload.hasOwnProperty(key) &&
      typeof key != undefined &&
      (value === null || value === "")
    ) {
      emptyOrNullFields.push(key);
    }
  });

  return emptyOrNullFields;
};

export const PayloadCannotContain = <T extends Record<string, any>>(
  payload: T,
  noEditKeys: string[]
): string[] => {
  const emptyOrNullFields: string[] = [];

  Object.entries(payload).forEach(([key, value]) => {
    if (
      payload.hasOwnProperty(key) &&
      typeof key != undefined &&
      noEditKeys.includes(key)
    ) {
      emptyOrNullFields.push(key);
    }
  });

  return emptyOrNullFields;
};

export const isValidPayload = <T extends Record<string, any>>(
  data: any,
  dto: string[]
): data is T => {
  const interfaceKeys = dto;
  const payloadKeys = Object.keys(data);
  // console.log({ ...payloadKeys });
  // console.log({ ...interfaceKeys });

  if (interfaceKeys.length !== payloadKeys.length) {
    console.log("first: ", interfaceKeys.length, ", ", payloadKeys.length);
    return false;
  }

  return payloadKeys.every((key) => interfaceKeys.includes(key));
};

export const compareAndUpdateProperties = (
  incomingData: any,
  existingData: any
) => {
  const properties = Object.keys(incomingData);
  const propertiesDB = Object.keys(existingData);

  for (const incomingKey of properties) {
    const incomingValue = incomingData[incomingKey];

    for (const dbKey of propertiesDB) {
      if (dbKey === "Id") continue;

      const dbValue = existingData[dbKey];

      if (incomingKey === dbKey) {
        // typeof will return object if the value is array or object
        const dbValueType = typeof dbValue === "object";
        const incomingValueType = typeof incomingValue === "object";
        const isNullOrUndefined =
          incomingValue === undefined || incomingValue === null;

        if (dbValueType && incomingValueType && !isNullOrUndefined) {
          if (Array.isArray(incomingValue)) {
            const objToList = incomingValue;
            const modelToList = dbValue || [];
            objToList.forEach((item) => modelToList.push(item.toString()));
            existingData[dbKey] = modelToList;
            break;
          } else {
            existingData[dbKey] = incomingValue;
          }
        } else if (!dbValueType && !incomingValueType && !isNullOrUndefined) {
          existingData[dbKey] = incomingValue;
        }
        break;
      } else if (incomingKey !== dbKey) {
        continue;
      }
    }
  }
};
