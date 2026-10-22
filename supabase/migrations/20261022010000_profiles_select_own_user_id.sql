-- Signed-in users must be able to look up their own profile with `where user_id = auth.uid()`.
-- Filtering on a column needs select on that column. Anonymous visitors still cannot read user_id.
grant select (user_id) on public.profiles to authenticated;
