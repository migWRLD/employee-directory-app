alter table public.employees add column location text not null default '' check (length(location) <= 160);
comment on column public.employees.location is 'Public city, state and time zone. Initial locations were sample values requested for the demo.';

-- One-time demo backfill. Existing nonblank locations are preserved.
with missing as (select id, row_number() over (order by md5(id::text)) as n from public.employees where trim(location) = '')
update public.employees e set location = (array['Los Angeles, CA (PT)','San Antonio, TX (CT)','Los Angeles, CA (PT)','San Antonio, TX (CT)','Denver, CO (MT)','New York, NY (ET)','Phoenix, AZ (MST)'])[1 + ((m.n - 1) % 7)::int], updated_at=now() from missing m where e.id=m.id returning e.name,e.location;