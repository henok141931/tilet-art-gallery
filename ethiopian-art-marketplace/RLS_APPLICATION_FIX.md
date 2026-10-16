# Artist application RLS fix

Artist application writes are now sent to a same-origin Next.js route handler at
`/api/artist-applications`. The route resolves the signed-in user on the server and derives
`user_id` from that authenticated session instead of trusting a browser-supplied UUID.
PostgreSQL Row Level Security remains enabled and remains the final access-control layer.

No SQL policy needs to be disabled or weakened for this fix.
