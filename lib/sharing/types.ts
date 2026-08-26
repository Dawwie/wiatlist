export type ShareLink = { token: string; url: string; expiresAt: string };

export type ListMember = { id: string; name: string; email: string };

export type ShareState = { links: ShareLink[]; members: ListMember[] };

export type InvitedList = { listId: string; name: string };
