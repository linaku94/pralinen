import {afterEach,expect,it,vi} from 'vitest';
import {api} from '../src/api';
afterEach(()=>vi.unstubAllGlobals());
it('reports non-JSON API failures without exposing a JSON parser error',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('404 Not Found',{status:404})));
  await expect(api('/api/admin/shopping-lists/undefined/recipes',{method:'POST'})).rejects.toThrow('HTTP 404');
});
it('keeps server validation messages for JSON responses',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({error:'Die Liste wurde inzwischen geändert.'},{status:409})));
  await expect(api('/api/admin/shopping-lists/list')).rejects.toThrow('Die Liste wurde inzwischen geändert.');
});
