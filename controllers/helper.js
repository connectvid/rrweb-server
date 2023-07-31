const instantiate = (constructor, properties, descriptors) =>
  Object.keys(descriptors)
    .map((key) => [key, descriptors[key]])
    .filter(([, descriptor]) => !!descriptor)
    .map(([key, descriptor]) => [
      key,
      typeof descriptor === "function"
        ? {
            value: descriptor,
            enumerable: false,
          }
        : typeof descriptor.reflect === "string"
        ? Object.assign({}, descriptor, reflect(descriptor.reflect.split(".")))
        : descriptor,
    ])
    .reduce(
      (instance, [key, descriptor]) =>
        Object.defineProperty(
          instance,
          key,
          Object.assign(
            {
              configurable: true,
            },
            descriptor
          )
        ),
      Object.assign(new constructor(), properties)
    );
exports.instantiate = instantiate;
