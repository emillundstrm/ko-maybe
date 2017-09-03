# Knockout Maybe

Maybe-like wrapper for knockout observables. Extremely experimental/early version.

# Usage

A common usage is to avoid null checks when you have long chains of observables.

```
var KoMaybe = require('ko-maybe');

// Computed on deep nested structure
var myComputed = ko.pureComputed(function () {
    var org = ko.unwrap(organisation);
    if (org) {
        var ceo = ko.unwrap(org.ceo);
        if (ceo) {
            var email = ko.unwrap(ceo.emailAddress);
            if (email) {
                return email.toUpperCase();
            }
        }
    }
});

// Becomes
var myComputed = KoMaybe.wrap(organisation).prop('CEO').prop('emailAddress').map(e => e.toUpperCase()).computed();

```

# Notes

Implements Functor and Monad in a non-strict sense.

- KoMaybe represents an empty value with "null" or "undefined". This has the implication that `m.map(x => null)` is
  equivalent to KoMaybe.empty(). This breaks the functor law, but only if you are working with null values.
- KoMaybe considers ko.observables the same type as itself. This breaks the chain law, but only in the sense that it
  accepts expressions that are technically type errors.

# API

See ko-maybe.js for now.