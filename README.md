# c-aghfabsowecwn

Singleton server for `aghfabsowecwn`, so `UAC` query occurs only once per node process.


# Install

```sh
npm i @mh-cbon/c-aghfabsowecwn --save
```

# Usage

It follows the exact same signature as [aghfabsowecwn](https://github.com/mh-cbon/aghfabsowecwn).

The only difference being that you can
require it as many times as you need within the same node process,
only one server will be spawned,
thus only one `UAC` query will appear for the end user.
