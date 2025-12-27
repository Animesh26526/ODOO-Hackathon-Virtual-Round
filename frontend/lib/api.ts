export * from '../src/lib/api';
import { api as _api, authLogin, authRegister, apiFetch } from '../src/lib/api';

const callable: any = (path: string, options?: any) => apiFetch(path, options);
// copy helper methods onto callable
Object.assign(callable, _api);

export const api = callable;
export { callable as __api, authLogin, authRegister, apiFetch };
export default callable;
