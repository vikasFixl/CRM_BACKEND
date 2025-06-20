// utils/paginateQuery.js
export const paginateQuery = async (Model, query = {}, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = options.sort || { _id: -1 };

  const [total, data] = await Promise.all([
    Model.countDocuments(query),
    Model.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
  ]);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data,
  };
};
