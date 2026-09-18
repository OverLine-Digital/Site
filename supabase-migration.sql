-- ============================================================
-- Historique des migrations appliquées au projet Supabase
-- "OverLine-Digital's Project" (déjà exécutées directement en
-- production via le connecteur Supabase — ce fichier sert de
-- référence si tu dois recréer l'environnement ailleurs).
-- ============================================================

-- 1. Colonne "viewed_at" : marque quand l'admin a consulté la demande.
alter table public.bookings
  add column if not exists viewed_at timestamptz;

-- 2. Active le temps réel (Realtime) sur la table "bookings" (utilisé
--    par le dashboard admin pour se rafraîchir sans reload).
alter publication supabase_realtime add table public.bookings;

-- 3. Colonne "example_files" : chemins Supabase Storage des fichiers
--    d'exemple/schéma (site/app/logiciel uniquement). La colonne
--    "files" existante sert aux documents (tous les types de projet).
alter table public.bookings
  add column if not exists example_files text[] default '{}';

-- 4. Bucket de stockage privé pour les fichiers joints au formulaire.
--    Upload public autorisé (le client n'a pas de compte), lecture
--    réservée à l'équipe connectée.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-request-files',
  'project-request-files',
  false,
  10485760,
  array['application/pdf','image/png','image/jpeg','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

create policy "Autoriser upload public dans project-request-files"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'project-request-files');

create policy "Lecture project-request-files reservee aux authentifies"
on storage.objects for select
to authenticated
using (bucket_id = 'project-request-files');

-- 5. Fonction sécurisée pour le suivi de projet SANS création de compte.
--    Important : la policy RLS de "bookings" n'autorise la lecture (SELECT)
--    qu'aux utilisateurs authentifiés (l'équipe) — volontairement, pour ne
--    jamais exposer les demandes de tous les clients à n'importe qui.
--    Cette fonction (SECURITY DEFINER) contourne la RLS de façon contrôlée :
--    elle ne renvoie QUE la ligne dont le project_id ET le nom complet
--    correspondent exactement à ce qui est fourni. Utilisée par
--    /track/status à la place d'une lecture directe de la table.
create or replace function public.get_booking_status(p_project_id text, p_full_name text)
returns table (
  project_id text,
  full_name text,
  service_name text,
  status text,
  viewed_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select b.project_id, b.full_name, b.service_name, b.status, b.viewed_at, b.created_at
  from public.bookings b
  where upper(trim(b.project_id)) = upper(trim(p_project_id))
    and lower(trim(b.full_name)) = lower(trim(p_full_name))
  limit 1;
$$;

revoke all on function public.get_booking_status(text, text) from public;
grant execute on function public.get_booking_status(text, text) to anon, authenticated;

-- ============================================================
-- Politiques RLS actuelles sur "bookings" (vérifiées) :
-- ============================================================
-- INSERT : anon, authenticated (le formulaire public peut créer une demande)
-- SELECT : authenticated uniquement (jamais anon en direct — voir point 5
--          ci-dessus pour la lecture publique contrôlée via la fonction)

-- 6. Colonne "ip_address" : permet un rate-limiting par IP en plus de l'email
--    (un email seul est trivialement contournable — plusieurs adresses au
--    même endroit). Index dédié pour que le check par IP (fenêtre glissante)
--    reste rapide même quand la table grossit.
alter table public.bookings
  add column if not exists ip_address text;

create index if not exists bookings_ip_created_at_idx
  on public.bookings (ip_address, created_at);

-- 7. Policies UPDATE et DELETE manquantes — BUG CRITIQUE corrigé ici : sans
--    elles, aucune action admin (changement de statut, marquer lu, suppression)
--    n'était réellement écrite en base. PostgREST renvoyait un "succès" avec
--    0 ligne affectée (silencieux, pas d'erreur), donc le dashboard semblait
--    fonctionner alors que rien ne changeait jamais côté client. Restreint à
--    "authenticated", qui ne concerne que les comptes admin créés à la main
--    dans Supabase Auth (aucune inscription publique sur le site).
create policy "Mise a jour reservee aux utilisateurs authentifies"
  on public.bookings
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Suppression reservee aux utilisateurs authentifies"
  on public.bookings
  for delete
  to authenticated
  using (true);

-- 8. Table "assistant_messages" — messages laissés depuis le widget assistant
--    (voir components/ai-assistant.tsx) quand l'IA n'est pas disponible.
--    Même modèle de sécurité que "bookings" : INSERT public, SELECT/UPDATE/
--    DELETE réservés à l'équipe. Réplication Realtime activée par cohérence.
create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  contact_name text,
  contact_email text,
  ip_address text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.assistant_messages enable row level security;

create policy "Autoriser insertion publique des messages assistant"
  on public.assistant_messages
  for insert
  to anon, authenticated
  with check (true);

create policy "Lecture reservee aux utilisateurs authentifies (assistant)"
  on public.assistant_messages
  for select
  to authenticated
  using (true);

create policy "Mise a jour reservee aux utilisateurs authentifies (assistant)"
  on public.assistant_messages
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Suppression reservee aux utilisateurs authentifies (assistant)"
  on public.assistant_messages
  for delete
  to authenticated
  using (true);

create index if not exists assistant_messages_ip_created_at_idx
  on public.assistant_messages (ip_address, created_at);

alter publication supabase_realtime add table public.assistant_messages;

-- 9. FAILLE CORRIGÉE : l'upload de fichiers (bucket project-request-files)
--    n'avait aucune limite de débit — la policy INSERT publique ne
--    vérifiait que le nom du bucket, donc l'API Storage de Supabase pouvait
--    être appelée directement avec la clé publique anon, en contournant
--    totalement le site et ses limites de débit. Les uploads passent
--    désormais par app/api/upload-file/route.ts (limite de débit + double
--    validation serveur), donc l'upload direct anonyme n'a plus lieu d'être.
drop policy if exists "Autoriser upload public dans project-request-files" on storage.objects;

create table if not exists public.upload_log (
  id uuid primary key default gen_random_uuid(),
  ip_address text,
  created_at timestamptz not null default now()
);

alter table public.upload_log enable row level security;
-- Volontairement 0 policy : seul service_role (notre route serveur) peut
-- lire/écrire cette table, jamais un client anonyme ou authentifié direct.

create index if not exists upload_log_ip_created_at_idx
  on public.upload_log (ip_address, created_at);

-- 10. FAILLE CORRIGÉE : /track et /track/status appelaient la fonction
--     get_booking_status directement depuis le navigateur (clé publique
--     anon), sans aucune limite de débit — combiné à un Project ID qui
--     n'avait que 4 chiffres aléatoires (9 000 combinaisons, voir
--     generateProjectId dans lib/validation.ts, augmenté à 6 chiffres/
--     900 000 combinaisons), une recherche par force brute avec un nom
--     connu était réaliste. Passe désormais par
--     app/api/track-status/route.ts (limite de débit ajoutée).
create table if not exists public.track_lookup_log (
  id uuid primary key default gen_random_uuid(),
  ip_address text,
  created_at timestamptz not null default now()
);

alter table public.track_lookup_log enable row level security;
-- Volontairement 0 policy également, même raison que upload_log ci-dessus.

create index if not exists track_lookup_log_ip_created_at_idx
  on public.track_lookup_log (ip_address, created_at);

-- 11. Suivi enrichi côté client (/track/status) : ajout d'une vraie colonne
--     "dernière mise à jour" (mise à jour automatiquement par trigger à
--     chaque UPDATE de la ligne), et la fonction get_booking_status vérifie
--     désormais aussi le nom d'entreprise (facultatif si non renseigné à la
--     demande) en plus du nom et de la référence — troisième facteur
--     d'identification, et renvoie plus de colonnes utiles (company,
--     duration_label, duration_weeks, updated_at) pour un suivi plus riche.
alter table public.bookings
  add column if not exists updated_at timestamptz not null default now();

update public.bookings set updated_at = coalesce(viewed_at, created_at) where updated_at is null;

create or replace function public.set_bookings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row
  execute function public.set_bookings_updated_at();

-- IMPORTANT : CREATE OR REPLACE avec une signature différente crée une
-- fonction EN PLUS plutôt que de remplacer l'ancienne (surcharge par
-- signature) — l'ancienne version à 2 arguments doit être supprimée
-- explicitement pour éviter toute ambiguïté côté PostgREST.
drop function if exists public.get_booking_status(text, text);

create or replace function public.get_booking_status(
  p_project_id text,
  p_full_name text,
  p_company text default null
)
returns table (
  project_id text,
  full_name text,
  company text,
  service_name text,
  status text,
  duration_label text,
  duration_weeks integer,
  viewed_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select b.project_id, b.full_name, b.company, b.service_name, b.status,
         b.duration_label, b.duration_weeks, b.viewed_at, b.updated_at, b.created_at
  from public.bookings b
  where upper(trim(b.project_id)) = upper(trim(p_project_id))
    and lower(trim(b.full_name)) = lower(trim(p_full_name))
    and (
      b.company is null
      or trim(b.company) = ''
      or lower(trim(b.company)) = lower(trim(coalesce(p_company, '')))
    )
  limit 1;
$$;

grant execute on function public.get_booking_status(text, text, text) to anon, authenticated, service_role;
