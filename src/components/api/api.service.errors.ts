class BadRequestError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'BadRequestError';
  }
}
class NotFoundError extends Error {
  statusCode: any;
  platform: string;
  artist: string;
  title: string;

  constructor(data: any) {
    super(data.message);
    this.name = 'NotFoundError';
    this.statusCode = data.statusCode || 404;
    this.platform = data.platform || 'Unknown platform';
    this.artist = data.artist || 'Unknown artist';
    this.title = data.title || 'Unknown title';
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
  //console.log('handleApiErrors:', error);
  if (!error) {
    throw new ApiError('Some error happend, but no Error object. WFT?!');
  }

  if (error.response) {
    if (error.response.status === 400) {
      // 400 Bad Request
      throw new BadRequestError(error.message);
    } else if (error.response.status === 404) {
      // 404 Not Found
      console.log('Not found API Error: ', error.response.data);
      throw new NotFoundError(error.response.data);
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
  } else {
    throw new Error(error);
  }
}

export {
  handleApiErrors,
  BadRequestError,
  NotFoundError,
  DataUpdateError,
  ApiError,
};
