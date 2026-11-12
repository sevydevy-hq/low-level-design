// A small JSON Schema checker covering the parts our schemas use, so the tools need no packages.
// Supported: $ref (#/...), type, required, properties, additionalProperties, propertyNames,
// minProperties, items, minItems, maxItems, uniqueItems, minLength, pattern, enum.

const typeOf = (v) => (Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v);

export function validate(schema, data, root = schema, path = '$', errors = []) {
  if (schema.$ref) {
    let target = root;
    for (const part of schema.$ref.replace(/^#\//, '').split('/')) target = target[part];
    return validate(target, data, root, path, errors);
  }
  if (schema.type) {
    const actual = typeOf(data);
    const ok = schema.type === actual || (schema.type === 'integer' && Number.isInteger(data));
    if (!ok) {
      errors.push(`${path}: should be ${schema.type}, is ${actual}`);
      return errors;
    }
  }
  if (schema.enum && !schema.enum.some((v) => JSON.stringify(v) === JSON.stringify(data))) {
    errors.push(`${path}: should be one of ${schema.enum.join(', ')}`);
  }
  if (typeof data === 'string') {
    if (schema.minLength != null && data.length < schema.minLength) errors.push(`${path}: is empty`);
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      errors.push(`${path}: "${data}" does not match ${schema.pattern}`);
    }
  }
  if (Array.isArray(data)) {
    if (schema.minItems != null && data.length < schema.minItems) errors.push(`${path}: needs at least ${schema.minItems} item(s)`);
    if (schema.maxItems != null && data.length > schema.maxItems) errors.push(`${path}: allows at most ${schema.maxItems} item(s)`);
    if (schema.uniqueItems && new Set(data.map((x) => JSON.stringify(x))).size !== data.length) {
      errors.push(`${path}: has duplicates`);
    }
    if (schema.items) data.forEach((x, i) => validate(schema.items, x, root, `${path}[${i}]`, errors));
  }
  if (typeOf(data) === 'object') {
    for (const key of schema.required || []) if (!(key in data)) errors.push(`${path}: missing "${key}"`);
    if (schema.minProperties != null && Object.keys(data).length < schema.minProperties) {
      errors.push(`${path}: needs at least ${schema.minProperties} key(s)`);
    }
    for (const [key, value] of Object.entries(data)) {
      if (schema.propertyNames) validate(schema.propertyNames, key, root, `${path} key "${key}"`, errors);
      if (schema.properties && key in schema.properties) {
        validate(schema.properties[key], value, root, `${path}.${key}`, errors);
      } else if (schema.additionalProperties === false) {
        errors.push(`${path}: unknown key "${key}"`);
      } else if (typeOf(schema.additionalProperties) === 'object') {
        validate(schema.additionalProperties, value, root, `${path}.${key}`, errors);
      }
    }
  }
  return errors;
}
