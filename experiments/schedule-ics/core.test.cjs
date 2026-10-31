'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');const {build,fold}=require('./core.cjs');
const base={summary:'合成テスト・毎週の練習',startDate:'2026-11-01',endDate:'2026-11-30',weekday:1,startTime:'18:00',endTime:'19:00',excludeDates:['2026-11-23'],seriesId:'synthetic-series-001'};
test('dates and excluded occurrence; explicit JST -> UTC',()=>{const r=build(base);a.deepEqual(r.dates,['2026-11-02','2026-11-09','2026-11-16','2026-11-30']);a.equal(r.count,4);a.match(r.ics,/DTSTART:20261102T090000Z\r\nDTEND:20261102T100000Z/);a.match(r.ics,/RRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20261130T145959Z/);a.match(r.ics,/EXDATE:20261123T090000Z/);});
test('midnight JST uses preceding UTC day',()=>a.match(build({...base,startTime:'00:00',endTime:'00:30'}).ics,/DTSTART:20261101T150000Z/));
test('first occurrence may be excluded',()=>a.deepEqual(build({...base,excludeDates:['2026-11-02']}).dates,['2026-11-09','2026-11-16','2026-11-23','2026-11-30']));
test('duplicate exclusions deduplicated',()=>a.equal(build({...base,excludeDates:['2026-11-23','2026-11-23']}).count,4));
test('no matching occurrence refuses',()=>a.throws(()=>build({...base,startDate:'2026-11-03',endDate:'2026-11-03',excludeDates:[]}),/ありません/));
test('invalid calendar dates refuse',()=>{for(const value of ['2026-02-29','2026-13-01','bad','1999-12-31'])a.throws(()=>build({...base,startDate:value}));});
test('invalid times/overnight refuse',()=>{for(const patch of [{startTime:'24:00'},{endTime:'18:00'},{startTime:'20:00',endTime:'01:00'}])a.throws(()=>build({...base,...patch}));});
test('invalid periods, weekday, and exclusions refuse',()=>{for(const patch of [{endDate:'2026-10-01'},{endDate:'2028-01-01'},{weekday:7},{excludeDates:['2026-11-03']},{excludeDates:['2027-11-01']},{excludeDates:'bad'}])a.throws(()=>build({...base,...patch}));});
test('escape property injection and UTF-8 folding round trip',()=>{const summary='練習,確認;\\\nBEGIN:VEVENT';const s=build({...base,summary}).ics;a.equal((s.match(/\r\nBEGIN:VEVENT\r\n/g)||[]).length,1);a.match(s,/SUMMARY:練習\\,確認\\;\\\\\\nBEGIN:VEVENT/);const long='SUMMARY:'+'予定😀'.repeat(100);const f=fold(long);a.ok(f.split('\r\n').every(x=>Buffer.byteLength(x)<=75));a.equal(f.replace(/\r\n /g,''),long);});
test('envelope, CRLF, identifier and control validation',()=>{const s=build(base).ics;a.ok(s.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));a.ok(s.endsWith('END:VEVENT\r\nEND:VCALENDAR\r\n'));a.ok(!/(?<!\r)\n/.test(s));for(const patch of [{summary:'x\0y'},{summary:''},{seriesId:'x\nBEGIN:VEVENT'}])a.throws(()=>build({...base,...patch}));});

test('all occurrences excluded refuses',()=>a.throws(()=>build({...base,excludeDates:['2026-11-02','2026-11-09','2026-11-16','2026-11-23','2026-11-30']}),/ありません/));
test('leap day and malformed DTSTAMP',()=>{a.equal(build({...base,startDate:'2028-02-29',endDate:'2028-02-29',weekday:2,excludeDates:[]}).count,1);for(const value of ['bad','20260230T120000Z','20261031T250000Z'])a.throws(()=>build(base,value));});
