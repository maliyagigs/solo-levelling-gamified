# Firebase Security Specification

## Data Invariants
1. A leaderboard entry must contain a valid, non-empty `playerName` string.
2. The `updatedAt` field must always match the server timestamp.
3. The `level` and `gold` values must be non-negative integers.

## The Dirty Dozen Payloads
We verify that these payloads designed to violate system constraints will be blocked:
1. Entry creation without `playerName`.
2. Entry creation with negative level.
3. Entry creation with negative gold.
4. Setting a fake `updatedAt` client-side timestamp.
5. Spoofing another player's name (where ID doesn't match ID rules).
6. Injecting a massive string into job.
7. Injecting a massive string into rank.
8. Writing to arbitrary non-existing collections.
9. Writing with an invalid or malicious document ID.
10. Attempting to update another user's leaderboard entry.
11. Deleting other users' entries.
12. Creating a leaderboard entry as an unauthenticated traveler.

## Test Runner Verification
Our security rules defined in `firestore.rules` will reject permissions for unauthorized, spoofed, or un-validated operations.
