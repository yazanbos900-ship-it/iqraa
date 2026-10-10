import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './config';
import { useAuth } from './AuthContext';
import { StudentNotification } from '../types';

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

export interface NotificationContextType {
  notifications: StudentNotification[];
  unreadCount: number;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  isSyncing: boolean;
  syncErrorMessage: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<StudentNotification, 'id'> & { id?: string }) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  refreshSync: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const mapNotification = (id: string, data: Record<string, unknown>): StudentNotification => ({
  id,
  title: String(data.title || ''),
  message: String(data.message || ''),
  date: String(data.date || 'الآن'),
  read: Boolean(data.read),
  type: (data.type || 'system') as StudentNotification['type'],
  userId: typeof data.userId === 'string' ? data.userId : undefined,
  createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
  updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  link: typeof data.link === 'string' ? data.link : undefined,
  syncedWithFirestore: true,
});

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setNotifications([]);
    if (!user) {
      setSyncStatus('offline');
      setIsSyncing(false);
      setSyncErrorMessage(null);
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'notifications'), (snapshot) => {
      const items = snapshot.docs.map((item) => mapNotification(item.id, item.data()));
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setNotifications(items);
      setSyncStatus('connected');
      setLastSyncedAt(new Date());
      setSyncErrorMessage(null);
      setIsSyncing(false);
    }, (error) => {
      setSyncStatus('error');
      setSyncErrorMessage(error.code === 'permission-denied'
        ? 'قواعد Firestore الحالية لا تسمح بقراءة إشعارات هذا الحساب.'
        : error.message);
      setIsSyncing(false);
    });
    return unsubscribe;
  }, [user]);

  const addNotification = useCallback(async (notification: Omit<StudentNotification, 'id'> & { id?: string }) => {
    if (!user) throw new Error('سجّل الدخول أولاً لحفظ الإشعار.');
    if (notification.userId && notification.userId !== user.uid) throw new Error('لا يمكن إرسال إشعار إلى حساب آخر من هذه العملية.');
    const id = notification.id || doc(collection(db, 'users', user.uid, 'notifications')).id;
    const now = new Date().toISOString();
    await setDoc(doc(db, 'users', user.uid, 'notifications', id), {
      title: notification.title,
      message: notification.message,
      date: notification.date || 'الآن',
      read: Boolean(notification.read),
      type: notification.type,
      userId: user.uid,
      createdAt: notification.createdAt || now,
      updatedAt: now,
      ...(notification.link ? { link: notification.link } : {}),
    });
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true, updatedAt: new Date().toISOString() });
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    const unread = notifications.filter((item) => !item.read);
    const batch = writeBatch(db);
    unread.forEach((item) => batch.update(doc(db, 'users', user.uid, 'notifications', item.id), { read: true, updatedAt: new Date().toISOString() }));
    if (unread.length) await batch.commit();
  }, [notifications, user]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'notifications', id));
  }, [user]);

  const sendTestNotification = useCallback(async () => {
    await addNotification({
      title: 'إشعار اختبار الربط',
      message: `تم حفظ الإشعار لحسابك (${user?.email || user?.uid}) في Firestore.`,
      type: 'system',
      read: false,
      date: 'الآن',
      userId: user?.uid,
    });
  }, [addNotification, user]);

  const refreshSync = useCallback(async () => {
    if (!user) {
      setSyncStatus('offline');
      setNotifications([]);
      return;
    }
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      const snapshot = await getDocs(collection(db, 'users', user.uid, 'notifications'));
      const items = snapshot.docs.map((item) => mapNotification(item.id, item.data()));
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setNotifications(items);
      setSyncStatus('connected');
      setLastSyncedAt(new Date());
      setSyncErrorMessage(null);
    } catch (error) {
      setSyncStatus('error');
      setSyncErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  const value = useMemo(() => ({
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
    syncStatus,
    lastSyncedAt,
    isSyncing,
    syncErrorMessage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    sendTestNotification,
    refreshSync,
  }), [notifications, syncStatus, lastSyncedAt, isSyncing, syncErrorMessage, markAsRead, markAllAsRead, deleteNotification, addNotification, sendTestNotification, refreshSync]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
