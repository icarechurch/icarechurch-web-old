-- Function to check gallery limit
create or replace function public.check_gallery_limit()
returns trigger as $$
declare
    image_count integer;
begin
    select count(*) into image_count
    from public.gallery_images;

    if image_count >= 40 then
        raise exception 'Gallery limit reached. Maximum 40 images allowed.';
    end if;

    return new;
end;
$$ language plpgsql;

-- Trigger to enforce limit before insert
create trigger enforce_gallery_limit
before insert on public.gallery_images
for each row
execute function public.check_gallery_limit();
