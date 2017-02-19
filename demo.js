import test from 'ava';
import chai from 'chai';
import Y from './index';

const should = chai.should();
const FACT10 = 3628800;

test('step0:起点', t => {
    function factorial(n) {
        return n === 0 ? 1 : n * factorial(n - 1);
    }
    factorial(10).should.equal(FACT10);
});

test('step1:将factorial作为参数传入', t => {
    function factorial(n) {
        return n === 0 ? 1 : n * factorial(n - 1);
    }

    function anonymous1(factorial) {
        return function (n) {
            return n === 0 ? 1 : n * factorial(n - 1);
        };
    }

    const anonymous2 = f => (n => n == 0 ? 1 : n * f(n - 1));
    anonymous1(factorial)(10).should.equal(FACT10);
    anonymous2(factorial)(10).should.equal(FACT10);
    (f => (n => n == 0 ? 1 : n * f(n - 1)))(factorial)(10).should.equal(FACT10);
});

test('step2:将自身作为参数传入', t => {
    function anonymous(whatever) {
        return function (n) {
            return n === 0 ? 1 : n * (whatever(whatever))(n - 1);
            //等价于 return n === 0 ? 1 : n * (anonymous(whatever))(n - 1);
        };
    }
    const factorial = anonymous(anonymous);
    factorial(10).should.equal(FACT10);
    (function (whatever) {
        return function (n) {
            return n === 0 ? 1 : n * (whatever(whatever))(n - 1);
        };
    })(function (whatever) {
        return function (n) {
            return n === 0 ? 1 : n * (whatever(whatever))(n - 1);
        };
    })(10).should.equal(FACT10);
});

test('step3:抽取重复逻辑', t => {
    (f => f(f))(function (whatever) {
        return function (n) {
            return n === 0 ? 1 : n * (whatever(whatever))(n - 1);
        };
    });

    (f => f(f))(function (whatever) {
        return (function (whatever) {
            return function (n) {
                return n === 0 ? 1 : n * whatever(n - 1);
            };
        })(n => whatever(whatever)(n));
    });

    //把自身调用自身的逻辑封装成callSelf函数
    function anonymous1(whatever) {
        function callSelf(n) {
            return whatever(whatever)(n);
        }
        return function (n) {
            return n === 0 ? 1 : n * callSelf(n - 1);
        }
    }

    //把callSelf函数提取成参数传入
    function anonymous2(whatever) {
        function callSelf(n) {
            return whatever(whatever)(n);
        };
        return (function (whatever) {
            return function (n) {
                return n === 0 ? 1 : n * whatever(n - 1);
            };
        })(callSelf);
    }

    //拆成两个独立的函数
    function step1_anonymous(factorial) {
        return function (n) {
            return n === 0 ? 1 : n * factorial(n - 1);
        };
    }
    function anonymous3(whatever) {
        function callSelf(n) {
            return whatever(whatever)(n);
        };
        return step1_anonymous(callSelf);
    }

    //重新封装
    function factorialFactory(step1_anonymous) {
        //return anonymous3(anonymous3);
        return (function (whatever) {
            function callSelf(n) {
                return whatever(whatever)(n);
            };
            return step1_anonymous(callSelf);
        })(function (whatever) {
            function callSelf(n) {
                return whatever(whatever)(n);
            };
            return step1_anonymous(callSelf);
        });
    }

    anonymous1(anonymous1)(10).should.equal(FACT10);
    anonymous2(anonymous2)(10).should.equal(FACT10);
    anonymous3(anonymous3)(10).should.equal(FACT10);
    factorialFactory(step1_anonymous)(10).should.equal(FACT10);
});

test('step4:finally got Y', t => {
    function step1_anonymous(factorial) {
        return function (n) {
            return n === 0 ? 1 : n * factorial(n - 1);
        };
    }
    const Y1 = function (f) {
        return (function (x) {
            return f(n => x(x)(n));
        })(function (x) {
            return f(n => x(x)(n));
        });
    };


    const Y2 = f => (x => f(n => x(x)(n)))(x => f(n => x(x)(n)));

    Y1(step1_anonymous)(10).should.equal(FACT10);
    Y2(step1_anonymous)(10).should.equal(FACT10);
});

test('step5:test Y use fibonacci function', t => {
    const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
    const fibonacci = Y(fib => (n => (n <= 2 ? 1 : fib(n - 1) + fib(n - 2))));
    fibonacci(5).should.equal(FIB[5]);
    fibonacci(10).should.equal(FIB[10]);
});

test('evaluation strategy', t => {
    function step1_anonymous(factorial) {
        return function (n) {
            return n === 0 ? 1 : n * factorial(n - 1);
        };
    }
    function anonymous1(whatever) {
        function callSelf(n) {
            return whatever(whatever)(n);
        };
        return step1_anonymous(callSelf);
    }
    function anonymous2(whatever) {
        return step1_anonymous(whatever(whatever));
    }
    anonymous1(anonymous1)(10).should.equal(FACT10);
    t.throws(() => anonymous2(anonymous2), 'Maximum call stack size exceeded');

    function Y1(f) {
        return f(Y1(f));
    }
    function Y2(f) {
        return f(function (x) {
            return (Y2(f))(x);
        });
    }
    Y2(step1_anonymous)(10).should.equal(FACT10);
    t.throws(() => Y1(step1_anonymous), 'Maximum call stack size exceeded');
});

test('fix point', t => {
    function factorial(n) {
        return n === 0 ? 1 : n * factorial(n - 1);
    }

    function anonymous(factorial) {
        return function (n) {
            return n === 0 ? 1 : n * factorial(n - 1);
        };
    }

    function whatever(x) {
        throw new Error('Gotcha!');
    }

    const fact0 = anonymous(whatever);
    const fact1 = anonymous(anonymous(whatever));
    const fact2 = anonymous(anonymous(anonymous(whatever)));
    const fact3 = anonymous(anonymous(anonymous(anonymous(whatever))));
    // const factn = anonymous(anonymous(anonymous(n...)))

    fact0(0).should.equal(factorial(0));
    t.throws(() => fact0(1), 'Gotcha!');
    fact1(1).should.equal(factorial(1));
    t.throws(() => fact1(2), 'Gotcha!');
    fact2(2).should.equal(factorial(2));
    t.throws(() => fact2(3), 'Gotcha!');
    fact3(3).should.equal(factorial(3));
    t.throws(() => fact3(4), 'Gotcha!');
    // factn(n).should.equal(factorial(n));

    const Y = function (f) {
        return f(x => Y(f)(x));
    }

    Y(anonymous)(10).should.equal(FACT10);
});