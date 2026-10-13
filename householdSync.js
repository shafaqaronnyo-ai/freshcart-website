import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const db = url && key ? createClient(url, key) : null;
const saved = 'freshcart_household';

export function useHousehold(setItems, catalog) {
  const [space, setSpace] = useState(null);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(db ? 'Connecting…' : 'Supabase configuration required');
  const [busy, setBusy] = useState(false);
  const [invite, setInvite] = useState('');
  const [recovery, setRecovery] = useState('');
  const [version, refresh] = useState(0);

  useEffect(() => {
    if (!db) return;
    let active = true;
    (async () => {
      try {
        const { data: session, error: sessionError } = await db.auth.getSession();
        if (sessionError) throw sessionError;
        let id = session.session?.user?.id;
        if (!id) {
          const { data, error } = await db.auth.signInAnonymously();
          if (error) throw error;
          id = data.user.id;
        }
        if (!active) return;
        setUser(id);
        const { data: memberships, error } = await db.from('space_members').select('space_id').eq('user_id', id);
        if (error) throw error;
        let household = memberships.find(m => m.space_id === localStorage.getItem(saved))?.space_id || memberships[0]?.space_id;
        if (!household) {
          const result = await db.rpc('create_shopping_space');
          if (result.error) throw result.error;
          household = result.data;
        }
        if (active) { localStorage.setItem(saved, household); setSpace(household); setMessage('Household connected'); }
      } catch (error) { if (active) setMessage(error.message); }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!db || !space) return;
    let active = true;
    setItems([]);
    const load = async () => {
      const { data, error } = await db.from('grocery_items').select('id,name,emoji,category,is_checked,created_at')
        .eq('space_id', space).order('created_at');
      if (!active) return;
      if (error) { setMessage(error.message); return; }
      setItems((data || []).map(i => ({
        id: i.id, name: i.name, completed: i.is_checked, category: i.category,
        image: catalog.find(c => c.name.toLowerCase() === i.name.toLowerCase())?.image
      })));
    };
    load();
    const channel = db.channel('freshcart-' + space).on('postgres_changes',
      { event: '*', schema: 'public', table: 'grocery_items', filter: 'space_id=eq.' + space },
      load).subscribe();
    const timer = setInterval(load, 5000);
    return () => { active = false; clearInterval(timer); db.removeChannel(channel); };
  }, [space, version, setItems, catalog]);

  async function write(operation) {
    if (!db || !space) { setMessage('Household not connected'); return false; }
    const { error } = await operation();
    if (error) { setMessage(error.message); return false; }
    refresh(v => v + 1);
    return true;
  }

  async function rpc(name, args, callback) {
    if (!db || !user || busy) return;
    setBusy(true);
    try {
      const { data, error } = await db.rpc(name, args);
      if (error) throw error;
      callback(data);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  function switchSpace(id) {
    if (!id) { setMessage('Code invalid or expired'); return; }
    localStorage.setItem(saved, id);
    setSpace(id);
    setInvite('');
    setMessage('Household connected');
  }

  return {
    enabled: Boolean(db), connected: Boolean(space), message, busy, invite, recovery,
    create: () => rpc('create_shopping_space', {}, switchSpace),
    inviteMember: () => rpc('create_space_invitation', { p_space_id: space }, code => { setInvite(code); setMessage('Invitation expires in 10 minutes and works once'); }),
    join: code => rpc('redeem_space_invitation', { p_code: code.trim().toUpperCase() }, switchSpace),
    createRecovery: () => rpc('create_space_recovery_code', { p_space_id: space }, code => { setRecovery(code); setMessage('Store your recovery code securely'); }),
    recover: code => rpc('redeem_space_recovery_code', { p_code: code.trim().toUpperCase() }, switchSpace),
    add: entries => write(() => db.from('grocery_items').insert(entries.map(i => ({
      space_id: space, name: i.name, category: i.category || null, emoji: i.emoji || null, is_checked: false
    })))),
    toggle: (item, autoClear) => write(() => autoClear && !item.completed
      ? db.from('grocery_items').delete().eq('space_id', space).eq('id', item.id)
      : db.from('grocery_items').update({ is_checked: !item.completed }).eq('space_id', space).eq('id', item.id)),
    remove: id => write(() => db.from('grocery_items').delete().eq('space_id', space).eq('id', id)),
    clearCompleted: () => write(() => db.from('grocery_items').delete().eq('space_id', space).eq('is_checked', true)),
    clearAll: () => write(() => db.from('grocery_items').delete().eq('space_id', space))
  };
}
