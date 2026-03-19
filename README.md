# minim

A React.js component for rendering music encoded with MNX. Still a work-in-progress!

## Peer requirements

Minim (as of v0.0.7) works with React 19.2.3 or above, and Node 20+.

Ideally the package will in the future work within any Javascript environment; I'm considering creating a web component version, &c.

## How to use

Add `@quonset/minim` as a dependency to your project:

```bash
npm i @quonset/minim --save
```

Import `@quonset/minim` into your project, import a valid [MNX](https://w3c.github.io/mnx/docs/) document (saved with a `.json` extension), and pass the document to Minim:

```js
import Minim from '@quonset/minim';
import myFirstComposition from '@/path/to/my-first-composition.json';
...

export default function Component() {
  return (
    <div>
      <Minim score={myFirstComposition} />
    </div>
  )
}
```

Note: As of v0.0.7, There are some differences between what I've implemented and the MNX spec — mainly to deal with outlier "modern" notational systems (such as allowing for multiple concurrent tempi and/or meters). Down the road, I hope to allow a consumer of Minim to render "CWMN" (i.e. canonical MNX) notation, as well as "extended" (i.e. polytemporal, etc.) notation.

An open question, too, is whether or not MNX documents can be nested. More on this in subsequent releases.

## Documentation

TBD. At the moment, this package is under slow but active development. Hoping to get there with some minimal (and much needed) documentation, partly to be sure development continues along a productive trajectory.

## Contributing

### Publishing new versions

1. Create a PR of the work, with

- the version number already incremented, and
- a CHANGELOG entry describing the work you did.

2. When that PR is merged into `master`, and while on `master`, run: `npm publish --access public`

- Follow semantic versioning (0.0.1 for feature fixes/bugs, 0.1.0 for new features that are backward-compatible, and 1.0.0 for new features that break backward-compatibility).
