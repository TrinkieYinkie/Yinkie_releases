# Landing analytics

The current client uses the [shared v2 contract](contracts/landing-analytics-v2.md) and [example](contracts/landing-analytics-v2.example.json).

Both landing sites share the same sender, UI, attribution, temporary page/event identities and opt-out behavior. Production sending remains disabled in `landing-analytics-config.js`. The earlier v1 fixture is historical and is not sent. Backend implementation and activation are separate work.
