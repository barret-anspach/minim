Notes

So. Let's reset what the purpose of this project is.

High level goals
- Render reflowable scores from [WHAT IS THE FORMAT IN WHICH A SCORE IS DELIVERED??], taking into consideration
  - vertical alignment of both durational and display quanta


Score
- Saved to/read from JSON
  - [MNX](https://w3c.github.io/mnx/docs/)
- Edit b/w/o text/Markdown
  - Some kind of SVG-like set of string commands
    - (pro) would be the most extensible;
    - (pro/con) favors expert use
- Edit b/w/o GUI
  - (pro) user-friendly
  - (con) more difficult to achieve

---

#### Tempo notes.

##### Units

To make meaningful comparisons between tempi—to perform metric modulations or scale the events of concurrent flows with distinct tempi, among other operations—we need a basic unit with which to compare them.

I believe **designUnitsPerMeasure** (DU/m) makes a good case as it's easily calculated from tempi and durations.

```
The tempo marking "q = 120"
  ===
    {
      value:
        {
          base: 'quarter',
          dots: 0
        },
      bpm: 120
    }
  === 1024 DU * 120 bpm, where 1 quarter === 1024 DU
  === 122880 DU/m
```
(where "value"/duration/[MNX note value object](https://w3c.github.io/mnx/docs/mnx-reference/objects/note-value/) is an alias for the "beat" in bpm)


##### Concurrent flows with distinct tempi
| Tempo 1 | Tempo 2 | Comparison |
|-|-|-|
| `q = 126` | `e. = 168` |  |
| 129024 DU/m | 129024 DU/m | Equivalent
