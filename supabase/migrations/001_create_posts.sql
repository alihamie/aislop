create table posts (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  category text not null,
  ai_rating int not null,
  ai_verdict text not null,
  human_upvotes int default 0,
  created_at timestamptz default now()
);
