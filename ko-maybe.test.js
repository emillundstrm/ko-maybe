var test = require('tape');
var KoMaybe = require('./ko-maybe.js');
var ko = require('knockout');
var sut = KoMaybe.wrap(ko.observable('test'));
var R = require('ramda');

function equals(t, a, b) {
    return t.equal(a.extract(), b.extract());
}

function identity(x) {
    return x;
}

function length(x) {
    return x.length;
}

function double(x) {
    return x * 2;
}

test('Functor', function (t) {
    equals(t, sut, sut.map(identity));
    equals(t, sut.map(length).map(double), sut.map(R.compose(double, length)));
    t.end();
});

test('Applicative / Apply', function (t) {
    var lengthWrap = sut.of(length);
    var doubleWrap = sut.of(double);
    equals(t, sut.ap(lengthWrap).ap(doubleWrap), sut.ap(lengthWrap.ap(doubleWrap.map(f => g => x => f(g(x))))));
    t.end();
});

test('Chain', function (t) {
    var a = KoMaybe.of({a: KoMaybe.of({b: KoMaybe.of('hej')})});
    var f = x => x.a;
    var g = x => x.b;
    equals(t, a.chain(f).chain(g), a.chain(x => f(x).chain(g)))
    t.end();
});

test('Computed', function (t) {
    var obs = ko.observable('hej');
    var computed = KoMaybe.wrap(obs).map(length).computed();
    t.equals(3, computed())
    obs('test');
    t.equals(4, computed());
    t.end();
});

test('Deep structure', function (t) {
    var model = {
        organisation: ko.observable({
            ceo: ko.observable({
                email: ko.observable('foo@example.com')
            })
        })
    };
    t.equals(15, KoMaybe.of(model).prop('organisation').prop('ceo').prop('email').map(length).extract());
    t.end();
});

/*
 Fails for an unknown reason.
test('Lifting a function', function (t) {
    var liftedAdd = R.lift((a,b) => a + b);
    t.equals(3, liftedAdd(KoMaybe.of(1), KoMaybe.of(2)).extract());
    t.end();
});
*/