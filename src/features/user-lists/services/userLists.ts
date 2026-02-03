
export interface UserList {
  id: string;
  name: string;
  languageId: number;
  description: string | null;
  isArchived: boolean;
  updatedAt?: string;
  _count?: {
    items: number;
  };
  createdAt?: string;
  language?: {
    name: string;
    iso_code: string;
  }
}

export interface CreateListParams {
  name: string;
  languageId: number;
  description?: string;
}

export async function fetchUserLists(languageId?: number): Promise<UserList[]> {
  const params = new URLSearchParams();
  if (languageId) params.append('languageId', languageId.toString());

  const res = await fetch(`/api/user-lists?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch lists');

  const data = await res.json();
  return data.lists;
}

export async function createUserList(params: CreateListParams): Promise<UserList> {
  const res = await fetch('/api/user-lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to create list');
  }

  const result = await res.json();
  return result.list;
}

export async function addVerbToBeList(listId: string, verb: string, language: string, context?: string | null) {
  const res = await fetch(`/api/user-lists/${listId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verb, language, context }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to add verb to list');
  }

  return await res.json();
}

export async function fetchListItems(listId: string) {
  const res = await fetch(`/api/user-lists/${listId}/items`);
  if (!res.ok) throw new Error('Failed to fetch list items');
  const data = await res.json();
  return data.items;
}

export async function fetchUserList(listId: string): Promise<UserList> {
  const res = await fetch(`/api/user-lists/${listId}`);
  if (!res.ok) throw new Error('Failed to fetch list');
  const data = await res.json();
  return data.list;
}

export async function deleteUserList(listId: string): Promise<void> {
  const res = await fetch(`/api/user-lists/${listId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete list');
}


export async function deleteUserListItem(listId: string, itemId: string): Promise<void> {
  const res = await fetch(`/api/user-lists/${listId}/items/${itemId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete item');
}

export interface Language {
  id: number;
  name: string;
  iso_code: string;
}

export async function fetchLanguages(): Promise<Language[]> {
  const res = await fetch('/api/languages');
  if (!res.ok) throw new Error('Failed to fetch languages');
  const data = await res.json();
  return data.languages;
}
