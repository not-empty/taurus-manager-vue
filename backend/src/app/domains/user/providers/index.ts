import { container } from 'tsyringe';
import IHashProvider from './HashProvider/models/IHashProvider';
import BCryptHashProvider from './HashProvider/BCryptHashProvider';

container.registerSingleton<IHashProvider>('HashProvider', BCryptHashProvider);
