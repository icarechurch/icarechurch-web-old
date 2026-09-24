-- Create gallery_images table
create table if not exists public.gallery_images (
    id uuid not null default gen_random_uuid(),
    title text not null,
    description text,
    image_url text not null,
    created_at timestamp with time zone not null default now(),
    constraint gallery_images_pkey primary key (id)
);

-- Enable RLS
alter table public.gallery_images enable row level security;

-- Policies for gallery_images
-- Allow public read access
create policy "Enable read access for all users"
on public.gallery_images
for select
to public
using (true);

-- Allow authenticated users (admin) to insert
create policy "Enable insert for authenticated users only"
on public.gallery_images
for insert
to authenticated
with check (true);

-- Allow authenticated users to update
create policy "Enable update for authenticated users only"
on public.gallery_images
for update
to authenticated
using (true)
with check (true);

-- Allow authenticated users to delete
create policy "Enable delete for authenticated users only"
on public.gallery_images
for delete
to authenticated
using (true);

-- Create storage bucket for gallery if not exists
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- Storage policies for gallery bucket
-- Allow public access to view images
create policy "Give public access to gallery images"
on storage.objects for select
to public
using ( bucket_id = 'gallery' );

-- Allow authenticated upload
create policy "Enable authenticated uploads"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'gallery' );

-- Allow authenticated delete
create policy "Enable authenticated delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'gallery' );

-- Allow authenticated update
create policy "Enable authenticated updates"
on storage.objects for update
to authenticated
using ( bucket_id = 'gallery' );
