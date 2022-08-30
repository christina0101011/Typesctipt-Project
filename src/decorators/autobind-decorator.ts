export function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const initialValue = descriptor.value;

  const adjustedValue: PropertyDescriptor = {
    get() {
      const boundFn = initialValue.bind(this);
      return boundFn;
    },
  };
  return adjustedValue;
}