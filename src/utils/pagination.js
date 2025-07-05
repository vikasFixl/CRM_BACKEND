export const paginateQuery = async (
  Model,
  query = {}, // Can be a filter object or aggregation pipeline
  options = {}
) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;

  const isAggregation = Array.isArray(query);
  const sort = options.sort || { _id: -1 };

  if (isAggregation) {
    // When query is aggregation pipeline
    const pipeline = [...query];

    // Apply $sort, $skip, and $limit in aggregation
    pipeline.push({ $sort: sort });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const [data, totalResult] = await Promise.all([
      Model.aggregate(pipeline),
      Model.aggregate([...query, { $count: "total" }])
    ]);

    const total = totalResult[0]?.total || 0;

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  } else {
    // Normal find query
    let mongoQuery = Model.find(query).sort(sort).skip(skip).limit(limit);

    if (options.populate) mongoQuery = mongoQuery.populate(options.populate);
    if (options.lean) mongoQuery = mongoQuery.lean();

    const [data, total] = await Promise.all([
      mongoQuery,
      Model.countDocuments(query),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  }
};
