'use strict';
// Unpublished feasibility core. No network, storage, calendar API, or OAuth.
const DAY=86400000, encoder=new TextEncoder(), days=['SU','MO','TU','WE','TH','FR','SA'];
function date(value){
 if(typeof value!=='string'||!/^20\d\d-\d{2}-\d{2}$/.test(value))throw Error('日付は2000〜2099年のYYYY-MM-DD');
 const ms=Date.parse(value+'T00:00:00Z');
 if(!Number.isFinite(ms)||new Date(ms).toISOString().slice(0,10)!==value)throw Error('存在しない日付');return ms;
}
function minutes(value){if(typeof value!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))throw Error('時刻はHH:MM');return Number(value.slice(0,2))*60+Number(value.slice(3));}
function stamp(ms){return new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');}
function text(value){if(typeof value!=='string'||!value.trim()||[...value].length>200||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value))throw Error('予定名は1〜200文字・制御文字不可');return value.replace(/\r\n?/g,'\n').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
function fold(line){let result='',part='',bytes=0;for(const ch of line){const n=encoder.encode(ch).length;if(bytes+n>75){result+=part+'\r\n';part=' ';bytes=1;}part+=ch;bytes+=n;}return result+part;}
function build(input,dtstamp=stamp(Date.now())){
 const start=date(input.startDate),end=date(input.endDate),from=minutes(input.startTime),to=minutes(input.endTime),summary=text(input.summary);
 if(end<start||end-start>365*DAY)throw Error('期間は開始以降・最大366日');
 if(!Number.isInteger(input.weekday)||input.weekday<0||input.weekday>6)throw Error('曜日は0〜6');
 if(to<=from)throw Error('同日内の終了時刻は開始より後');
 if(typeof input.seriesId!=='string'||!/^[a-z0-9-]{8,64}$/.test(input.seriesId))throw Error('系列IDは8〜64文字の英小文字・数字・ハイフン');
 if(!/^\d{8}T\d{6}Z$/.test(dtstamp)||(!Number.isFinite(Date.parse(dtstamp.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,'$1-$2-$3T$4:$5:$6Z')))||stamp(Date.parse(dtstamp.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,'$1-$2-$3T$4:$5:$6Z')))!==dtstamp))throw Error('DTSTAMP不正');
 const excluded=input.excludeDates??[];
 if(!Array.isArray(excluded)||excluded.length>53)throw Error('除外日は配列・最大53件');
 const exclusions=new Set(excluded.map(x=>{const ms=date(x);if(ms<start||ms>end||new Date(ms).getUTCDay()!==input.weekday)throw Error('除外日は期間内の対象曜日のみ');return ms;}));
 let first=start;while(first<=end&&new Date(first).getUTCDay()!==input.weekday)first+=DAY;
 const included=[];for(let d=first;d<=end;d+=7*DAY)if(!exclusions.has(d))included.push(new Date(d).toISOString().slice(0,10));
 if(!included.length)throw Error('登録する予定がありません');
 const utc=(d,m)=>stamp(d+(m-540)*60000); // JST -> UTC, no floating-time ambiguity.
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Columns Lab//Schedule ICS feasibility//JA','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+input.seriesId+'@schedule-ics.invalid','DTSTAMP:'+dtstamp,'DTSTART:'+utc(first,from),'DTEND:'+utc(first,to),'RRULE:FREQ=WEEKLY;BYDAY='+days[input.weekday]+';UNTIL='+stamp(end+DAY-1-540*60000)];
 if(exclusions.size)lines.push('EXDATE:'+[...exclusions].sort((a,b)=>a-b).map(d=>utc(d,from)).join(','));
 lines.push('SUMMARY:'+summary,'END:VEVENT','END:VCALENDAR');
 return {count:included.length,dates:included,ics:lines.map(fold).join('\r\n')+'\r\n'};
}
module.exports={build,fold};
