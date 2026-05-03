import {open} from '@op-engineering/op-sqlite';

let _db: ReturnType<typeof open> | null = null;

export function getDb() {
  if (!_db) {
    _db = open({name: 'chat.db'});
  }
  return _db;
}
