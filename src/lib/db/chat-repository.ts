import {v4 as uuidv4} from 'uuid';

import {getDb} from './index';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  title: string;
  modelPath: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Message {
  id: string;
  roomId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

// ─── Rooms ────────────────────────────────────────────────────────────────────

export function createRoom(modelPath?: string): Room {
  const now = Date.now();
  const room: Room = {
    id: uuidv4(),
    title: 'New Chat',
    modelPath: modelPath ?? null,
    createdAt: now,
    updatedAt: now,
  };
  getDb().executeSync('INSERT INTO rooms (id, title, model_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [
    room.id,
    room.title,
    room.modelPath,
    room.createdAt,
    room.updatedAt,
  ]);
  return room;
}

export function updateRoomTitle(id: string, title: string) {
  getDb().executeSync('UPDATE rooms SET title = ?, updated_at = ? WHERE id = ?', [title, Date.now(), id]);
}

export function updateRoomUpdatedAt(id: string) {
  getDb().executeSync('UPDATE rooms SET updated_at = ? WHERE id = ?', [Date.now(), id]);
}

export function getAllRooms(): Room[] {
  const result = getDb().executeSync('SELECT * FROM rooms ORDER BY updated_at DESC');
  return (result.rows ?? []).map(r => ({
    id: r.id as string,
    title: r.title as string,
    modelPath: (r.model_path as string | null) ?? null,
    createdAt: r.created_at as number,
    updatedAt: r.updated_at as number,
  }));
}

export function getRoomById(id: string): Room | null {
  const result = getDb().executeSync('SELECT * FROM rooms WHERE id = ?', [id]);
  const row = result.rows?.[0];
  if (!row) return null;
  return {
    id: row.id as string,
    title: row.title as string,
    modelPath: (row.model_path as string | null) ?? null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export function deleteRoom(id: string) {
  getDb().executeSync('DELETE FROM rooms WHERE id = ?', [id]);
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function saveMessage(roomId: string, role: 'user' | 'assistant', content: string): Message {
  const msg: Message = {
    id: uuidv4(),
    roomId,
    role,
    content,
    createdAt: Date.now(),
  };
  getDb().executeSync('INSERT INTO messages (id, room_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)', [
    msg.id,
    msg.roomId,
    msg.role,
    msg.content,
    msg.createdAt,
  ]);
  updateRoomUpdatedAt(roomId);
  return msg;
}

export function getMessagesByRoom(roomId: string): Message[] {
  const result = getDb().executeSync('SELECT * FROM messages WHERE room_id = ? ORDER BY created_at ASC', [roomId]);
  return (result.rows ?? []).map(r => ({
    id: r.id as string,
    roomId: r.room_id as string,
    role: r.role as 'user' | 'assistant',
    content: r.content as string,
    createdAt: r.created_at as number,
  }));
}

export function deleteMessagesByRoom(roomId: string) {
  getDb().executeSync('DELETE FROM messages WHERE room_id = ?', [roomId]);
}
