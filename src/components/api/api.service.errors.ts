class BadRequestError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'BadRequestError';
  }
}
class NotFoundError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'NotFoundError';
  }
}
class DataUpdateError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'DataUpdateError';
  }
}
class ApiError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleApiErrors(error: any): never {
  if (!error || !error.response) {
    throw new ApiError('Some error happend, but no Error object. WFT?!');
  }

  if (error.response.status === 400) {
    // 400 Bad Request
    throw new BadRequestError(error.message);
  } else if (error.response.status === 404) {
    // 404 Not Found
    throw new NotFoundError(error.message);
  } else if (error.response.status === 422) {
    // 422 Unprocessable Entity
    throw new DataUpdateError(error.message);
  } else {
    // Unknown
    throw new ApiError(
      `API Error: status = ${error.response.status}` +
        JSON.stringify(error.message),
    );
  }
}

export {
  handleApiErrors,
  BadRequestError,
  NotFoundError,
  DataUpdateError,
  ApiError,
};
