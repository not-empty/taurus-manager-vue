class CustomError {
  public readonly text: string;

  public readonly statusCode: number;

  constructor(
    text: string,
    statusCode: number,
  ) {
    this.text = text;
    this.statusCode = statusCode;
  }
}

export default CustomError;
