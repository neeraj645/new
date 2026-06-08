const asyncWrapper = (handler) =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next))
      .catch(next);

export default asyncWrapper;