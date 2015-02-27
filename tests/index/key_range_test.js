/**
 * @license
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.setTestOnly();
goog.require('goog.testing.jsunit');
goog.require('lf.index.Favor');
goog.require('lf.index.SingleKeyRange');


/**
 * Tests KeyRange#complement() for the case where the original key range has
 * specified bounds on both sides.
 */
function testComplement_WithBounds() {
  // Testing case where both lower and upper bound are included.
  var keyRange = new lf.index.SingleKeyRange(10, 20, false, false);
  var complementKeyRanges = keyRange.complement();
  assertEquals(2, complementKeyRanges.length);
  assertEquals('[unbound, 10)', complementKeyRanges[0].toString());
  assertEquals('(20, unbound]', complementKeyRanges[1].toString());

  // Testing case where lower bound is excluded.
  keyRange = new lf.index.SingleKeyRange(10, 20, true, false);
  complementKeyRanges = keyRange.complement();
  assertEquals(2, complementKeyRanges.length);
  assertEquals('[unbound, 10]', complementKeyRanges[0].toString());
  assertEquals('(20, unbound]', complementKeyRanges[1].toString());

  // Testing case where upper bound is excluded.
  keyRange = new lf.index.SingleKeyRange(10, 20, false, true);
  complementKeyRanges = keyRange.complement();
  assertEquals(2, complementKeyRanges.length);
  assertEquals('[unbound, 10)', complementKeyRanges[0].toString());
  assertEquals('[20, unbound]', complementKeyRanges[1].toString());

  // Testing case where both lower and upper bound are excluded.
  keyRange = new lf.index.SingleKeyRange(10, 20, true, true);
  complementKeyRanges = keyRange.complement();
  assertEquals(2, complementKeyRanges.length);
  assertEquals('[unbound, 10]', complementKeyRanges[0].toString());
  assertEquals('[20, unbound]', complementKeyRanges[1].toString());
}


/**
 * Tests KeyRange#complement() for the case where the original key range only
 * has an upper bound.
 */
function testComplement_UpperBoundOnly() {
  var keyRange = new lf.index.SingleKeyRange(null, 20, false, false);
  var complementKeyRanges = keyRange.complement();
  assertEquals(1, complementKeyRanges.length);
  assertEquals('(20, unbound]', complementKeyRanges[0].toString());

  keyRange = new lf.index.SingleKeyRange(null, 20, false, true);
  complementKeyRanges = keyRange.complement();
  assertEquals(1, complementKeyRanges.length);
  assertEquals('[20, unbound]', complementKeyRanges[0].toString());
}


/**
 * Tests KeyRange#complement() for the case where the original key range only
 * has an lower bound.
 */
function testComplement_LowerBoundOnly() {
  var keyRange = new lf.index.SingleKeyRange(20, null, false, false);
  var complementKeyRanges = keyRange.complement();
  assertEquals(1, complementKeyRanges.length);
  assertEquals('[unbound, 20)', complementKeyRanges[0].toString());

  keyRange = new lf.index.SingleKeyRange(20, null, true, false);
  complementKeyRanges = keyRange.complement();
  assertEquals(1, complementKeyRanges.length);
  assertEquals('[unbound, 20]', complementKeyRanges[0].toString());
}


/**
 * Tests KeyRange#complement() for the case where the original key range is not
 * bounded on either side.
 */
function testComplement_NoBound() {
  var keyRange = lf.index.SingleKeyRange.all();
  // The complement of a completely unbounded key range is the empty key range.
  assertEquals(0, keyRange.complement().length);
}


/**
 * Tests KeyRange#complement() for the case where the original key range
 * includes a single value.
 */
function testComplement_OnlyOneValue() {
  var keyRange = lf.index.SingleKeyRange.only(20);
  var complementKeyRanges = keyRange.complement();
  assertEquals(2, complementKeyRanges.length);
  assertEquals('[unbound, 20)', complementKeyRanges[0].toString());
  assertEquals('(20, unbound]', complementKeyRanges[1].toString());
}


function testReverse() {
  var keyRange = lf.index.SingleKeyRange.only(20);
  assertEquals('[20, 20]' , keyRange.toString());
  assertEquals('[20, 20]', keyRange.reverse().toString());

  keyRange = lf.index.SingleKeyRange.upperBound(20);
  assertEquals('[unbound, 20]' , keyRange.toString());
  assertEquals('[20, unbound]' , keyRange.reverse().toString());

  keyRange = lf.index.SingleKeyRange.lowerBound(20);
  assertEquals('[20, unbound]' , keyRange.toString());
  assertEquals('[unbound, 20]' , keyRange.reverse().toString());

  keyRange = lf.index.SingleKeyRange.all();
  assertEquals('[unbound, unbound]' , keyRange.toString());
  assertEquals('[unbound, unbound]' , keyRange.reverse().toString());

  keyRange = new lf.index.SingleKeyRange(20, 50, false, true);
  assertEquals('[20, 50)' , keyRange.toString());
  assertEquals('(50, 20]' , keyRange.reverse().toString());
}


function testContains() {
  var range = new lf.index.SingleKeyRange(0, 10, true, true);
  assertFalse(range.contains(-1));
  assertFalse(range.contains(0));
  assertTrue(range.contains(5));
  assertFalse(range.contains(10));
  assertFalse(range.contains(11));

  range = new lf.index.SingleKeyRange('B', 'D', false, false);
  assertFalse(range.contains('A'));
  assertTrue(range.contains('B'));
  assertTrue(range.contains('C'));
  assertTrue(range.contains('D'));
  assertFalse(range.contains('E'));
}


function testGetBounded() {
  var range = new lf.index.SingleKeyRange(1, 10, true, true);
  var bound = function(min, max) {
    var r = range.getBounded(min, max);
    return goog.isNull(r) ? 'null' : r.toString();
  };

  assertEquals('(1, 10)', bound(0, 11));
  assertEquals('(1, 10)', bound(1, 10));
  assertEquals('(1, 2]', bound(0, 2));
  assertEquals('[2, 10)', bound(2, 11));
  assertEquals('[2, 3]', bound(2, 3));
  assertEquals('null', bound(-1, 0));
  assertEquals('null', bound(11, 12));
}


function testXor() {
  var xor = lf.index.SingleKeyRange.xor;
  assertFalse(xor(true, true));
  assertTrue(xor(true, false));
  assertTrue(xor(false, true));
  assertFalse(xor(false, false));
}


function generateTestRanges() {
  return {
    all: lf.index.SingleKeyRange.all(),
    upTo1: lf.index.SingleKeyRange.upperBound(1),
    upTo1Ex: lf.index.SingleKeyRange.upperBound(1, true),
    upTo2: lf.index.SingleKeyRange.upperBound(2),
    atLeast1: lf.index.SingleKeyRange.lowerBound(1),
    atLeast1Ex: lf.index.SingleKeyRange.lowerBound(1, true),
    atLeast2: lf.index.SingleKeyRange.lowerBound(2),
    only1: lf.index.SingleKeyRange.only(1),
    only2: lf.index.SingleKeyRange.only(2),
    r1: new lf.index.SingleKeyRange(5, 10, false, false),
    r2: new lf.index.SingleKeyRange(5, 10, true, false),
    r3: new lf.index.SingleKeyRange(5, 10, false, true),
    r4: new lf.index.SingleKeyRange(5, 10, true, true),
    r5: new lf.index.SingleKeyRange(10, 11, false, false),
    r6: new lf.index.SingleKeyRange(1, 5, false, false),
    r7: new lf.index.SingleKeyRange(-1, 0, false, false)
  };
}


function testCompare() {
  var c = lf.index.SingleKeyRange.compare;
  var winner = lf.index.Favor;

  var r = generateTestRanges();

  var cases = [
    r.all,
    r.upTo1, r.upTo1Ex,
    r.atLeast1, r.atLeast1Ex,
    r.only1,
    r.r1, r.r2, r.r3, r.r4
  ];
  cases.forEach(function(r) {
    assertEquals(winner.TIE, c(r, r));
  });

  // Test pairs that RHS always wins.
  var pairs = [
    [r.all, r.upTo1],
    [r.all, r.atLeast1],
    [r.all, r.only1],
    [r.atLeast1, r.atLeast2],
    [r.upTo1, r.upTo2],
    [r.atLeast1, r.atLeast1Ex],
    [r.upTo1Ex, r.upTo1],
    [r.r1, r.r2],
    [r.r3, r.r1],
    [r.r1, r.r4],
    [r.r3, r.r2],
    [r.r1, r.r5],
    [r.r6, r.r1],
    [r.only1, r.only2]
  ];

  pairs.forEach(function(pair) {
    assertEquals(winner.RHS, c(pair[0], pair[1]));
    assertEquals(winner.LHS, c(pair[1], pair[0]));
  });
}


function testOverlaps() {
  var r = generateTestRanges();

  var cases = [
    r.all,
    r.upTo1, r.upTo1Ex,
    r.atLeast1, r.atLeast1Ex,
    r.only1,
    r.r1, r.r2, r.r3, r.r4
  ];
  cases.forEach(function(range) {
    assertTrue(range.overlaps(range));
    assertTrue(range.overlaps(r.all));
    assertTrue(r.all.overlaps(range));
  });

  var overlapping = [
    [r.upTo1, r.upTo1Ex],
    [r.upTo1, r.upTo2],
    [r.upTo1, r.only1],
    [r.upTo1, r.atLeast1],
    [r.upTo1, r.r6],
    [r.upTo1Ex, r.upTo2],
    [r.atLeast1, r.only1],
    [r.atLeast1, r.only2],
    [r.atLeast1, r.r1],
    [r.atLeast1, r.r6],
    [r.r1, r.r2],
    [r.r1, r.r3],
    [r.r1, r.r4],
    [r.r1, r.r5],
    [r.r1, r.r6],
    [r.r2, r.r3],
    [r.r2, r.r4]
  ];
  overlapping.forEach(function(pair) {
    assertTrue(pair[0].overlaps(pair[1]));
    assertTrue(pair[1].overlaps(pair[0]));
  });

  var excluding = [
    [r.upTo1, r.only2],
    [r.upTo1Ex, r.r6],
    [r.upTo1, r.atLeast1Ex],
    [r.upTo1, r.atLeast2],
    [r.upTo1Ex, r.only1],
    [r.upTo1Ex, r.only2],
    [r.only1, r.atLeast1Ex],
    [r.only1, r.atLeast2],
    [r.r3, r.r5],
    [r.r4, r.r5],
    [r.r2, r.r6],
    [r.r4, r.r6]
  ];
  excluding.forEach(function(pair) {
    assertFalse(pair[0].overlaps(pair[1]));
    assertFalse(pair[1].overlaps(pair[0]));
  });
}


function testUnion() {
  var u = lf.index.SingleKeyRange.union;
  var r = generateTestRanges();

  // Empty
  assertArrayEquals([], u([]));

  // Self
  assertArrayEquals([r.all], u([r.all]));
  assertArrayEquals([r.upTo1], u([r.upTo1]));
  assertArrayEquals([r.atLeast1], u([r.atLeast1]));
  assertArrayEquals([r.only1], u([r.only1]));
  assertArrayEquals([r.r1], u([r.r1]));
  assertArrayEquals([r.r2], u([r.r2, r.r2]));
  assertArrayEquals([r.r3], u([r.r3, r.r3]));
  assertArrayEquals([r.r4], u([r.r4, r.r4]));

  // Merge to r.all
  assertArrayEquals([r.all], u([r.all, r.upTo1]));
  assertArrayEquals([r.all], u([r.all, r.r1, r.r5]));
  assertArrayEquals([r.all], u([r.only2, r.only1, r.all]));
  assertArrayEquals([r.all], u([r.r1, r.only2, r.atLeast1Ex, r.all]));

  // Overlapping test cases.
  assertArrayEquals([r.upTo1], u([r.upTo1, r.upTo1Ex]));
  assertArrayEquals([r.upTo2], u([r.upTo1, r.upTo2]));
  assertArrayEquals([r.upTo1], u([r.upTo1, r.only1]));
  assertArrayEquals([r.all], u([r.upTo1, r.atLeast1]));
  assertArrayEquals(
      [lf.index.SingleKeyRange.upperBound(5)], u([r.upTo1, r.r6]));
  assertArrayEquals([r.upTo2], u([r.upTo1Ex, r.upTo2]));
  assertArrayEquals([r.atLeast1], u([r.atLeast1, r.only1]));
  assertArrayEquals([r.atLeast1], u([r.atLeast1, r.only2]));
  assertArrayEquals([r.atLeast1], u([r.atLeast1, r.r1]));
  assertArrayEquals([r.atLeast1], u([r.atLeast1, r.r6]));
  assertArrayEquals([r.r1], u([r.r1, r.r2]));
  assertArrayEquals([r.r1], u([r.r1, r.r3]));
  assertArrayEquals([r.r1], u([r.r1, r.r4]));
  assertArrayEquals(
      [new lf.index.SingleKeyRange(5, 11, false, false)],
      u([r.r1, r.r5]));
  assertArrayEquals(
      [new lf.index.SingleKeyRange(1, 10, false, false)],
      u([r.r1, r.r6]));
  assertArrayEquals([r.r1], u([r.r2, r.r3]));
  assertArrayEquals([r.r2], u([r.r2, r.r4]));
  assertArrayEquals([r.r1], u([r.r1, r.r2, r.r3, r.r4]));
  assertArrayEquals(
      [new lf.index.SingleKeyRange(1, 11, false, false)],
      u([r.r1, r.r2, r.r3, r.r4, r.r5, r.r6]));
  assertArrayEquals([r.all],
      u([r.atLeast1, r.r1, r.r5, r.r6, r.upTo1]));


  var excluding = [
    [r.upTo1, r.only2],
    [r.upTo1Ex, r.r6],
    [r.upTo1, r.atLeast1Ex],
    [r.upTo1, r.atLeast2],
    [r.upTo1Ex, r.only1],
    [r.upTo1Ex, r.only2],
    [r.only1, r.atLeast1Ex],
    [r.only1, r.atLeast2],
    [r.r3, r.r5],
    [r.r4, r.r5],
    [r.r6, r.r2],
    [r.r6, r.r4]
  ];
  excluding.forEach(function(pair) {
    assertArrayEquals(pair, u(pair));
  });
  assertArrayEquals([r.r7, r.r6, r.r5], u([r.r5, r.r7, r.r7, r.r6]));
}


function testIntersect() {
  var i = lf.index.SingleKeyRange.intersect;
  var r = generateTestRanges();

  // Empty
  assertNull(i([]));

  // Self
  assertObjectEquals(r.all, i([r.all]));
  assertObjectEquals(r.upTo1, i([r.upTo1]));
  assertObjectEquals(r.atLeast1, i([r.atLeast1]));
  assertObjectEquals(r.only1, i([r.only1]));
  assertObjectEquals(r.r1, i([r.r1]));
  assertObjectEquals(r.r2, i([r.r2, r.r2]));
  assertObjectEquals(r.r3, i([r.r3, r.r3]));
  assertObjectEquals(r.r4, i([r.r4, r.r4]));

  // Intersect with r.all should be self
  assertObjectEquals(r.upTo1, i([r.all, r.upTo1]));
  assertObjectEquals(r.r1, i([r.all, r.r1]));
  assertObjectEquals(r.only1, i([r.only1, r.all]));
  assertObjectEquals(r.atLeast1Ex, i([r.atLeast1Ex, r.all]));

  // Excluding shall return null.
  var excluding = [
    [r.upTo1, r.only2],
    [r.upTo1Ex, r.r6],
    [r.upTo1, r.atLeast1Ex],
    [r.upTo1, r.atLeast2],
    [r.upTo1Ex, r.only1],
    [r.upTo1Ex, r.only2],
    [r.only1, r.atLeast1Ex],
    [r.only1, r.atLeast2],
    [r.r3, r.r5],
    [r.r4, r.r5],
    [r.r6, r.r2],
    [r.r6, r.r4]
  ];
  excluding.forEach(function(pair) {
    assertNull(i(pair));
  });
  assertNull(i([r.r1, r.r2, r.r3, r.r4, r.r5]));
  assertNull(i([r.atLeast1, r.r1, r.r5, r.r6, r.upTo1]));

  // Overlapping test cases.
  assertObjectEquals(r.upTo1Ex, i([r.upTo1, r.upTo1Ex]));
  assertObjectEquals(r.upTo1, i([r.upTo1, r.upTo2]));
  assertObjectEquals(r.only1, i([r.upTo1, r.only1]));
  assertObjectEquals(r.only1, i([r.upTo1, r.atLeast1]));
  assertObjectEquals(r.only1, i([r.upTo1, r.r6]));
  assertObjectEquals(r.upTo1Ex, i([r.upTo1Ex, r.upTo2]));
  assertObjectEquals(r.only1, i([r.atLeast1, r.only1]));
  assertObjectEquals(r.only2, i([r.atLeast1, r.only2]));
  assertObjectEquals(r.r1, i([r.atLeast1, r.r1]));
  assertObjectEquals(r.r6, i([r.atLeast1, r.r6]));
  assertObjectEquals(r.r2, i([r.r1, r.r2]));
  assertObjectEquals(r.r3, i([r.r1, r.r3]));
  assertObjectEquals(r.r4, i([r.r1, r.r4]));
  assertObjectEquals(lf.index.SingleKeyRange.only(10), i([r.r1, r.r5]));
  assertObjectEquals(lf.index.SingleKeyRange.only(5), i([r.r1, r.r6]));
  assertObjectEquals(r.r4, i([r.r2, r.r3]));
  assertObjectEquals(r.r4, i([r.r1, r.r2, r.r3, r.r4]));
  assertObjectEquals(lf.index.SingleKeyRange.only(10), i([r.r1, r.r2, r.r5]));
}
