import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'

const SAVE_DEBOUNCE_MS = 1500

/**
 * useSupabase - manages loading and saving the crew loading project data.
 *
 * Schema (single table: crew_loading_state):
 *   id        text PRIMARY KEY  -- always 'main' (one shared state for the whole team)
 *   projects  jsonb             -- full projects array
 *   roster    jsonb             -- full roster array (supports additions)
 *   updated_at timestamptz      -- auto-updated by Supabase trigger
 *
 * Run this SQL in the Supabase SQL editor to create the table:
 *
 *   create table crew_loading_state (
 *     id text primary key,
 *     projects jsonb not null default '[]',
 *     roster jsonb not null default '[]',
 *     updated_at timestamptz default now()
 *   );
 *
 *   -- Allow public read/write (since this is an internal tool with no auth)
 *   alter table crew_loading_state enable row level security;
 *   create policy "allow all" on crew_loading_state for all using (true) with check (true);
 *
 *   -- Auto-update updated_at on every change
 *   create or replace function update_updated_at()
 *   returns trigger as $$
 *   begin new.updated_at = now(); return new; end;
 *   $$ language plpgsql;
 *
 *   create trigger set_updated_at
 *   before update on crew_loading_state
 *   for each row execute function update_updated_at();
 */
export function useSupabase(initialProjects, initialRoster) {
  const [projects, setProjects] = useState(initialProjects)
  const [roster, setRoster]     = useState(initialRoster)
  const [loadStatus, setLoadStatus] = useState('idle') // idle | loading | loaded | error | no-db
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error
  const [saveTimer, setSaveTimer]   = useState(null)

  // ── Load on mount ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) {
      setLoadStatus('no-db')
      return
    }
    setLoadStatus('loading')
    supabase
      .from('crew_loading_state')
      .select('projects, roster')
      .eq('id', 'main')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('Supabase load error:', error)
          setLoadStatus('error')
          return
        }
        if (data) {
          if (data.projects?.length > 0) setProjects(data.projects)
          if (data.roster?.length  > 0) setRoster(data.roster)
        }
        setLoadStatus('loaded')
      })
  }, [])

  // ── Real-time subscription — sync changes from other users ───────────────────
  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('crew_loading_realtime')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'crew_loading_state',
        filter: 'id=eq.main'
      }, (payload) => {
        if (payload.new?.projects) setProjects(payload.new.projects)
        if (payload.new?.roster)   setRoster(payload.new.roster)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Debounced save ────────────────────────────────────────────────────────────
  const scheduleSave = useCallback((nextProjects, nextRoster) => {
    setSaveStatus('idle')
    setSaveTimer(prev => {
      if (prev) clearTimeout(prev)
      return setTimeout(async () => {
        if (!supabase) return
        setSaveStatus('saving')
        const { error } = await supabase
          .from('crew_loading_state')
          .upsert({ id: 'main', projects: nextProjects, roster: nextRoster })
        setSaveStatus(error ? 'error' : 'saved')
        if (error) console.error('Supabase save error:', error)
        // Reset to idle after 2s
        setTimeout(() => setSaveStatus('idle'), 2000)
      }, SAVE_DEBOUNCE_MS)
    })
  }, [])

  // ── Wrapped setters that trigger auto-save ────────────────────────────────────
  const setProjectsAndSave = useCallback((updater) => {
    setProjects(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      scheduleSave(next, roster)
      return next
    })
  }, [roster, scheduleSave])

  const setRosterAndSave = useCallback((updater) => {
    setRoster(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      scheduleSave(projects, next)
      return next
    })
  }, [projects, scheduleSave])

  return {
    projects, setProjects: setProjectsAndSave,
    roster,   setRoster:   setRosterAndSave,
    loadStatus, saveStatus
  }
}
