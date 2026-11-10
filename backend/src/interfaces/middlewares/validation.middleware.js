export const validate = (schemaOrConfig) => {
  return (req, res, next) => {
    const errors = [];

    const run = (target, schema, options = { abortEarly: false, stripUnknown: true }) => {
      if (!schema) return null;
      const { error, value } = schema.validate(target, options);
      if (error) return error.details.map((d) => d.message);
      return value;
    };

    // Backwards-compatible: if a single schema is provided, treat it as body schema
    if (typeof schemaOrConfig === "function" || schemaOrConfig?.validate) {
      const result = run(req.body, schemaOrConfig);
      if (Array.isArray(result)) errors.push(...result);
      else if (result) req.body = result;
    } else if (typeof schemaOrConfig === "object" && schemaOrConfig !== null) {
      const { body, query, params } = schemaOrConfig;

      const bodyResult = run(req.body, body);
      if (Array.isArray(bodyResult)) errors.push(...bodyResult);
      else if (bodyResult) req.body = bodyResult;

      const queryResult = run(req.query, query, { abortEarly: false, stripUnknown: true });
      if (Array.isArray(queryResult)) errors.push(...queryResult);
      else if (queryResult) req.query = queryResult;

      const paramsResult = run(req.params, params, { abortEarly: false, stripUnknown: true });
      if (Array.isArray(paramsResult)) errors.push(...paramsResult);
      else if (paramsResult) req.params = paramsResult;
    }

    if (errors.length) {
      return res.status(400).json({ mensaje: "Validación fallida", data: null, error: errors });
    }

    next();
  };
};
