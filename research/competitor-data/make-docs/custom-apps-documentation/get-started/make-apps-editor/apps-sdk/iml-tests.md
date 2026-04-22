---
title: "Write IML tests | Custom Apps Documentation | Make Developer Hub"
url: https://developers.make.com/custom-apps-documentation/get-started/make-apps-editor/apps-sdk/iml-tests
scraped_at: 2026-04-21T12:45:24.885662Z
---

1. Get started chevron-right
2. Select your editor chevron-right
3. Visual Studio Code

# Write IML tests

You can write tests for your custom IML functions. Use the it function and asserts .

```
it
```

```
asserts
```

```
functionformatUsername(user){if(!user||!user.firstName||!user.lastName){returnnull;}return`${user.firstName}${user.lastName}`;}
```

```
it("should format full name correctly",()=>{constuser={firstName:"Jane",lastName:"Doe"};constresult=formatUsername(user);assert.strictEqual(result,"Jane Doe");});it("should return null if last name missing",()=>{constuser={firstName:"Jane"};constresult=formatUsername(user);assert.strictEqual(result,null);});
```

The it function accepts exactly two parameters, the name of the test and the code to run. In this code, we can verify expected outputs using assert.ok() function.

```
it
```

```
assert.ok()
```

When using IML functions that work with date and time, remember to set the correct timezone in extension settings. The accepted format is the international time zone format arrow-up-right .

```
timezone
```

For example "Europe/Prague"

### hashtag Common asserts functions

assert.ok(value)

```
assert.ok(value)
```

Passes if value is truthy.

assert.strictEqual(actual, expected)

```
assert.strictEqual(actual, expected)
```

Passes if actual === expected.

assert.deepStrictEqual(actual, expected)

```
assert.deepStrictEqual(actual, expected)
```

Passes if objects or arrays are deeply equal.

assert.notStrictEqual(actual, expected)

```
assert.notStrictEqual(actual, expected)
```

Passes if values are not strictly equal.

assert.throws(fn, [error])

```
assert.throws(fn, [error])
```

Passes if the function throws an error.

assert.doesNotThrow(fn)

```
assert.doesNotThrow(fn)
```

Passes if the function does not throw an error.

assert.match(string, regex)

```
assert.match(string, regex)
```

Passes if the string matches the regex.

assert.doesNotMatch(string, regex)

```
assert.doesNotMatch(string, regex)
```

Passes if the string does not match the regex.

## hashtag Run a test

To run a test on a specific function, right-click the function name in the tree and select Run IML test.

The test starts and the output is in the IML tests output channel.

Last updated 3 months ago
