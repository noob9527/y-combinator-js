# Y-COMBINATOR-JS
> derive the y combinator using pure javascript

The Y combinator discovered by [Haskell B. Curry](https://en.wikipedia.org/wiki/Haskell_Curry) is an implementation of the fixed-point combinator in lambda calculus.It defined as:
- call by value: `λf.(λx.f(λn.x x n))(λx.f(λn.x x n))`
- call by name: `λf.(λx.f(x x))(λx.f(x x))`

so in ecmascript 2015, It can be implement by one line
```javascript
f => (x => f(n => x(x)(n)))(x => f(n => x(x)(n)));
``` 

### Installation
using npm
```bash
npm install y-combinator-js
```

### Usage
it won't decrease the computation complexity, so don't use it in production enviroment,unless you know what you do. 
```javascript
import Y from 'y-combinator-js';
```

then enjoy it:
- factorial
    ```javascript
    const FACT10 = 3628800;
    const fact = Y(f => (n => n === 0 ? 1 : n * f(n - 1)));
    fact(10).should.equal(FACT10);
    ```

- fibonacci
    ```javascript
    const FIB = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
    const fibonacci = Y(fib => (n => (n <= 2 ? 1 : fib(n - 1) + fib(n - 2))));
    fibonacci(5).should.equal(FIB[5]);
    fibonacci(10).should.equal(FIB[10]);
    ```

### License
MIT