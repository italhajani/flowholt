# Design Survey Prep

FlowHolt has now entered the redesign-prep stage.

This means the product foundation is strong enough that the next major visual move should be a deliberate design survey before the full premium redesign starts.

## What is already prepared

- semantic shell and surface styling tokens in `globals.css`
- shared shell/card components updated to use those tokens
- a new in-app survey board at `/app/design`
- a dedicated `Design` navigation entry so the redesign phase has a visible home in the app

## Why this step matters

It prevents the redesign from becoming random visual churn. Instead, the next redesign phase can use a stable token layer and a clear set of design decisions from the user.

## What the survey should decide

- overall color mood
- sidebar density
- card style softness vs sharpness
- canvas chrome strength
- typography direction
- how visible reasoning/chat should stay during editing

## How to see it

1. Restart `flowholt-web`.
2. Open `/app/design`.
3. Review the direction cards and survey checklist.
4. Use that page as the starting point for the full premium redesign conversation.
