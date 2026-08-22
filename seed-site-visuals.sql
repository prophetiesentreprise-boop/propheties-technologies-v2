-- =========================================================================
-- SEED "siteVisuals" — 26 des 27 emplacements (hors QR code, à uploader à part)
-- À exécuter dans Supabase SQL Editor UNE FOIS la table créée par drizzle-kit push
-- =========================================================================

insert into "siteVisuals" (slot, "imageUrl") values ('homeHero', 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('servicesHero', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('tutorialsHero', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('aboutHero', 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('contactHero', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('networkService', 'https://images.unsplash.com/photo-1667264501379-c1537934c7ab?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('cyberService', 'https://images.unsplash.com/photo-1618588845382-4267677cfc11?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('supportService', 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('aiService', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('trainingService', 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('consultingService', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('homeDarkCta', 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('servicesDarkCta', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('aboutDarkCta', 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('serviceDetailDarkCta', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('footerBackground', 'https://images.unsplash.com/photo-1667264501379-c1537934c7ab?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('valueReliability', 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('valueConfidentiality', 'https://images.unsplash.com/photo-1618588845382-4267677cfc11?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('valueRigor', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('valueResponsiveness', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('methodNetwork', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('methodCyber', 'https://images.unsplash.com/photo-1618588845382-4267677cfc11?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('methodSupport', 'https://images.unsplash.com/photo-1667264501379-c1537934c7ab?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('methodAi', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('methodTraining', 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";
insert into "siteVisuals" (slot, "imageUrl") values ('methodConsulting', 'https://images.unsplash.com/photo-1758873268745-dd2cf0d677b5?w=1600&q=80&auto=format&fit=crop') on conflict (slot) do update set "imageUrl" = excluded."imageUrl";

-- =========================================================================
-- Bucket pour la narration audio (généré par npm run generate-narration)
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('site-audio', 'site-audio', true)
on conflict (id) do nothing;

drop policy if exists "Public read audio" on storage.objects;
create policy "Public read audio"
  on storage.objects for select
  using (bucket_id = 'site-audio');
