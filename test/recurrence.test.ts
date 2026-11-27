import test from 'node:test';
import assert from 'node:assert/strict';
import { occurrences, repeatText, type Rule } from '../src/lib/recurrence.ts';
const D = (s: string) => new Date(`${s}Z`);
const list = (r: Rule, a: string, b: string) => occurrences(r, D(a), D(b)).map((o) => o.start.toISOString().slice(0, 16) + (o.cancelled ? ' X' : o.moved ? ' M' : ''));
const meetup: Rule = { start: D('2026-10-24T12:00'), end: D('2026-10-24T13:30'), repeat: 'weekly' };

test('weekly keeps clock time across the November clock change', () => assert.deepEqual(list(meetup, '2026-10-24T00:00', '2026-11-08T00:00'), ['2026-10-24T12:00', '2026-10-31T12:00', '2026-11-07T12:00']));
test('and across the March one', () => assert.deepEqual(list({ ...meetup, start: D('2027-03-06T12:00'), end: D('2027-03-06T13:30') }, '2027-03-06T00:00', '2027-03-21T00:00'), ['2027-03-06T12:00', '2027-03-13T12:00', '2027-03-20T12:00']));
test('an occurrence stays until it ends, then drops', () => {
  assert.equal(list(meetup, '2026-10-24T13:30', '2026-10-25T00:00').length, 1);
  assert.equal(list(meetup, '2026-10-24T13:31', '2026-10-25T00:00').length, 0);
});
test('ongoing never runs out', () => assert.equal(list(meetup, '2040-01-01T00:00', '2040-01-31T23:00').length, 4));
test('several days a week; days before the start in week one are skipped', () => assert.deepEqual(list({ start: D('2026-01-29T10:00'), repeat: 'weekly', alsoOn: ['tue'] }, '2026-01-01T00:00', '2026-02-06T00:00'), ['2026-01-29T10:00', '2026-02-03T10:00', '2026-02-05T10:00']));
test('every other week', () => assert.deepEqual(list({ ...meetup, repeat: 'biweekly' }, '2026-10-24T00:00', '2026-11-22T00:00'), ['2026-10-24T12:00', '2026-11-07T12:00', '2026-11-21T12:00']));
test('until includes its own day', () => assert.deepEqual(list({ ...meetup, until: D('2026-10-31T00:00') }, '2026-10-01T00:00', '2027-01-01T00:00'), ['2026-10-24T12:00', '2026-10-31T12:00']));
test('the 31st skips short months', () => assert.deepEqual(list({ start: D('2027-01-31T18:30'), repeat: 'monthly-date' }, '2027-01-01T00:00', '2027-06-01T00:00'), ['2027-01-31T18:30', '2027-03-31T18:30', '2027-05-31T18:30']));
test('third Wednesday, over a year end', () => assert.deepEqual(list({ start: D('2026-11-18T18:30'), repeat: 'monthly-weekday' }, '2026-11-01T00:00', '2027-02-28T00:00'), ['2026-11-18T18:30', '2026-12-16T18:30', '2027-01-20T18:30', '2027-02-17T18:30']));
test('a fifth weekday means the last', () => assert.deepEqual(list({ start: D('2026-10-31T12:00'), repeat: 'monthly-weekday' }, '2026-10-01T00:00', '2027-01-31T00:00'), ['2026-10-31T12:00', '2026-11-28T12:00', '2026-12-26T12:00', '2027-01-30T12:00']));
test('leap day', () => assert.deepEqual(list({ start: D('2028-02-29T10:00'), repeat: 'monthly-date' }, '2028-02-01T00:00', '2028-04-30T00:00'), ['2028-02-29T10:00', '2028-03-29T10:00', '2028-04-29T10:00']));
test('cancelled and moved dates', () => assert.deepEqual(list({ ...meetup, exceptions: [{ date: D('2026-10-31T00:00'), change: 'cancelled', note: 'Storm' }, { date: D('2026-11-07T00:00'), change: 'moved', start: D('2026-11-08T13:00') }] }, '2026-10-24T00:00', '2026-11-15T00:00'), ['2026-10-24T12:00', '2026-10-31T12:00 X', '2026-11-08T13:00 M', '2026-11-14T12:00']));
test('a moved date keeps its length', () => assert.equal(occurrences({ ...meetup, exceptions: [{ date: D('2026-10-31T00:00'), change: 'moved', start: D('2026-10-31T15:00') }] }, D('2026-10-31T00:00'), D('2026-11-01T00:00'))[0].end.toISOString(), '2026-10-31T16:30:00.000Z'));
test('a date moved earlier, across the window edge, still shows', () => assert.deepEqual(list({ ...meetup, exceptions: [{ date: D('2026-11-14T00:00'), change: 'moved', start: D('2026-11-12T12:00') }] }, '2026-11-08T00:00', '2026-11-13T00:00'), ['2026-11-12T12:00 M']));
test('one-offs, no end time, all day, several days', () => {
  assert.equal(list({ start: D('2026-12-01T18:00') }, '2026-12-01T23:00', '2026-12-31T00:00').length, 1);
  assert.equal(list({ start: D('2026-12-01T18:00') }, '2026-12-02T00:00', '2026-12-31T00:00').length, 0);
  const fair: Rule = { start: D('2026-12-01T00:00'), end: D('2026-12-03T00:00'), allDay: true };
  assert.equal(list(fair, '2026-12-03T20:00', '2026-12-31T00:00').length, 1);
  assert.equal(list(fair, '2026-12-04T00:00', '2026-12-31T00:00').length, 0);
});
test('a date moved onto another regular date keeps its own identity', () => {
  const o = occurrences({ ...meetup, exceptions: [{ date: D('2026-10-31T00:00'), change: 'moved', start: D('2026-11-07T15:00') }] }, D('2026-11-07T00:00'), D('2026-11-08T00:00'));
  assert.deepEqual(o.map((x) => x.usual.toISOString().slice(0, 10)), ['2026-11-07', '2026-10-31']);
});
test('an all-day event whose end is before its start still lasts its own day', () => assert.equal(list({ start: D('2026-12-05T00:00'), end: D('2026-12-01T00:00'), allDay: true }, '2026-12-05T10:00', '2026-12-31T00:00').length, 1));
test('a stated end is told apart from the end of the day', () => {
  const day = [D('2026-10-24T00:00'), D('2026-10-25T00:00')] as const;
  assert.equal(occurrences(meetup, ...day)[0].ends?.toISOString(), '2026-10-24T13:30:00.000Z');
  assert.equal(occurrences({ ...meetup, end: undefined }, ...day)[0].ends, undefined);
});
test('a skipped date is not listed', () => assert.deepEqual(list({ ...meetup, exceptions: [{ date: D('2026-10-31T00:00'), change: 'skipped' }] }, '2026-10-24T00:00', '2026-11-08T00:00'), ['2026-10-24T12:00', '2026-11-07T12:00']));
test('exceptions left on an event that no longer repeats are ignored', () => assert.deepEqual(list({ start: D('2026-12-01T18:00'), repeat: 'none', until: D('2026-01-01T00:00'), alsoOn: ['fri'], exceptions: [{ date: D('2026-12-01T00:00'), change: 'skipped' }] }, '2026-11-01T00:00', '2026-12-31T00:00'), ['2026-12-01T18:00']));
test('words', () => {
  assert.equal(repeatText({ start: D('2026-01-27T10:00'), repeat: 'weekly', alsoOn: ['thu'] }), 'Every Tuesday and Thursday');
  assert.equal(repeatText({ start: D('2026-11-18T18:30'), repeat: 'monthly-weekday' }), 'Third Wednesday of the month');
});
