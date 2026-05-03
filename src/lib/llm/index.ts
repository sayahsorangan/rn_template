import {LlamaContext} from 'llama.rn';

let _context: LlamaContext | null = null;

export const LlamaManager = {
  getContext(): LlamaContext | null {
    return _context;
  },

  setContext(ctx: LlamaContext | null) {
    _context = ctx;
  },

  async release() {
    if (_context) {
      await _context.release();
      _context = null;
    }
  },
};
