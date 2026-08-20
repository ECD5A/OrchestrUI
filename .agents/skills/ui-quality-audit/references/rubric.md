# Quality rubric

| Category | Score 0 | Score 1 | Score 2 |
|---|---|---|---|
| Visual coherence | Conflicting tokens or demo fragments | Mostly coherent, minor documented drift | One deliberate visual language throughout |
| Library discipline | Redundant owners or base conflict | Overlap is isolated and justified | Minimum set, one owner per major role |
| Accessibility | Broken semantics, keyboard, focus or contrast | Core flow works; minor non-blocking gaps remain | Semantics, names, keyboard, focus and contrast verified |
| Responsiveness | Core flow clips or becomes unusable | Works at target widths with minor tradeoffs | Narrow, medium and wide layouts verified with real content |
| Motion/reduced motion | Harmful motion or no reduction path | Reduction exists but some decorative motion remains | Motion is purposeful, bounded and fully reduced when requested |
| Data-viz readability | Meaning depends on color or lacks labels/units | Readable with a documented density tradeoff | Labels, units, legends, states and color-independent cues verified |
| Rive lifecycle/rights | Unknown asset rights or leaked runtime lifecycle | Rights known; minor performance tradeoff | Rights recorded; cleanup, fallback and loading behavior verified |
| Engineering | Failing checks, unsafe dependency or secret | Checks pass with a documented warning | Lint/typecheck/tests/build and dependency/secret checks pass |
| Licensing | Pro content or React Bits redistribution | Notices need a minor correction | Public sources, notices and all special restrictions verified |

Evidence can include rendered interaction checks, source inspection, automated test output, bundle/dependency reports and exact official source links. A plan-only review is provisional and cannot replace the rendered audit.
