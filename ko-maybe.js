var ko = require('knockout');

function extract(koMaybe) {
    if (ko.isObservable(koMaybe)) {
        return koMaybe();
    }
    if (koMaybe instanceof KoMaybe) {
        return koMaybe.valueAccessor();
    }
}

function KoMaybe(valueAccessor) {
    this.valueAccessor = valueAccessor;
};

// Almost always the starting point - wrapping an observable
KoMaybe.wrap = function (observable) {
    return new KoMaybe(function () {
        return observable();
    });
};

// KoMaybe m, ko.computed c => m a ~> c a
KoMaybe.prototype.computed = function () {
    return ko.pureComputed(this.valueAccessor);
};

// KoMaybe m => m a ~> (a -> b) -> m b
KoMaybe.prototype.map = function (f) {
    var parent = this;
    return new KoMaybe(function () {
        var value = parent.valueAccessor();
        if (value != null) {
            return f(value);
        }
    });
};

// KoMaybe m => m a ~> m (a -> b) -> m b
KoMaybe.prototype.ap = function (maybeF) {
    return this.map(function (value) {
        var f = extract(maybeF);
        if (f) {
            return f(value);
        }
    });
};

// KoMaybe m => a -> m a
KoMaybe.of = KoMaybe.prototype.of = function (value) {
    return new KoMaybe(function () {
        return value;
    });
};

// KoMaybe m => m *
KoMaybe.empty = function () {
    return this.of();
};

// KoMaybe m => m a ~> (m -> a -> m b) -> m b
KoMaybe.prototype.chain = KoMaybe.prototype.flatMap = function (f) {
    return this.map(function (value) {
        return extract(f(value));
    });
};

// KoMaybe m => m a ~> (m a -> Boolean) -> m a
KoMaybe.prototype.filter = function (f) {
    var parent = this;
    return new KoMaybe(function () {
        var value = parent.valueAccessor();
        return value != null && f(value) ? value : undefined;
    });
};

// KoMaybe m => m {s: a} ~> s -> m a
KoMaybe.prototype.prop = function (key) {
    return this.chain(function (value) {
        return value[key];
    });
};


// KoMaybe m => m a ~> a
KoMaybe.prototype.extract = function () {
    return this.valueAccessor();
};

module.exports = KoMaybe;
