import { compare, hash } from 'bcrypt';
import IHashProvider from './models/IHashProvider';

class BCryptHashProvider implements IHashProvider {
  public async generate(data: string): Promise<string> {
    return hash(data, 8);
  }

  public async compare(data: string, hashed: string): Promise<boolean> {
    return compare(data, hashed);
  }
}

export default BCryptHashProvider;
