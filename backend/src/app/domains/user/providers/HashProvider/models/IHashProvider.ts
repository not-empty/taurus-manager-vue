interface IHashProvider {
  generate(data: string): Promise<string>;
  compare(data: string, hashed: string): Promise<boolean>;
}

export default IHashProvider;
