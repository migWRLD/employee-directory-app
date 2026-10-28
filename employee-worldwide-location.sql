alter table public.employees add column country text not null default '' check(length(country)<=100), add column region text not null default '' check(length(region)<=100), add column time_zone text not null default '' check(length(time_zone)<=100);

-- User-requested completion of the existing Vancouver entry.
update public.employees set country='Canada', region='British Columbia', time_zone='America/Vancouver', updated_at=now() where lower(trim(location))='vancouver' and country='' and time_zone='';

