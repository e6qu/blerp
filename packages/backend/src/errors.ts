export class BlerpAPIError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "BlerpAPIError";
    this.status = status;
    this.code = code;
  }
}

interface ErrorBody {
  error: {
    code: string;
    message: string;
    doc_url?: string;
    request_id?: string;
  };
}

export function throwIfError<T>(result: { data?: T; error?: ErrorBody; response: Response }): T {
  if (result.error) {
    const body = result.error as ErrorBody;
    throw new BlerpAPIError(result.response.status, body.error.code, body.error.message);
  }
  return result.data as T;
}
